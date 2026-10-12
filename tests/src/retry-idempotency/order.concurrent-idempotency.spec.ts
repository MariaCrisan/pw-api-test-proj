import { channel } from 'node:diagnostics_channel';
import type { IncomingMessage } from 'node:http';

import { expect, test, type APIRequestContext } from '@playwright/test';

import { OrderBuilder } from '../builders/api/order-builder';
import type { Order } from '../builders/types';
import { startOrderApiServer, type OrderApiServer } from '../utils/order-api-server';

test('shares one acceptance operation between concurrent duplicate requests', async ({
  request,
}) => {
  const processing = createGate();
  let acceptanceCalls = 0;
  let acceptedCorrelationId = '';
  const server = await startOrderApiServer({
    idempotent: true,
    onOrderAccepted: async (_order, correlationId) => {
      acceptanceCalls++;
      acceptedCorrelationId = correlationId;
      await processing.promise;
    },
  });
  const order = OrderBuilder.create().build();

  try {
    const responses = await sendOverlappingRequests(request, server, order, processing.release);
    const expectedBody = {
      orderId: order.orderId,
      correlationId: acceptedCorrelationId,
      status: 'accepted',
    };
    expect(responses.map((response) => response.status())).toEqual([201, 201]);
    expect(await Promise.all(responses.map((response) => response.json()))).toEqual([
      expectedBody,
      expectedBody,
    ]);
    expect(acceptanceCalls).toBe(1);

    const retry = await request.post(`${server.baseUrl}/orders`, {
      data: order,
      headers: { 'x-correlation-id': 'later-retry' },
    });
    expect(retry.status()).toBe(201);
    await expect(retry.json()).resolves.toEqual(expectedBody);
    expect(acceptanceCalls).toBe(1);
  } finally {
    processing.release();
    await server.close();
  }
});

test('shares an acceptance failure and allows a subsequent retry', async ({ request }) => {
  const processing = createGate();
  let acceptanceCalls = 0;
  let failAcceptance = true;
  const server = await startOrderApiServer({
    idempotent: true,
    onOrderAccepted: async () => {
      acceptanceCalls++;
      await processing.promise;
      if (failAcceptance) throw new Error('Order acceptance failed');
    },
  });
  const order = OrderBuilder.create().build();

  try {
    const responses = await sendOverlappingRequests(request, server, order, processing.release);
    expect(responses.map((response) => response.status())).toEqual([500, 500]);
    expect(await Promise.all(responses.map((response) => response.json()))).toEqual([
      { error: 'Order acceptance failed' },
      { error: 'Order acceptance failed' },
    ]);
    expect(acceptanceCalls).toBe(1);

    failAcceptance = false;
    const retry = await request.post(`${server.baseUrl}/orders`, {
      data: order,
      headers: { 'x-correlation-id': 'successful-retry' },
    });
    expect(retry.status()).toBe(201);
    await expect(retry.json()).resolves.toEqual({
      orderId: order.orderId,
      correlationId: 'successful-retry',
      status: 'accepted',
    });
    expect(acceptanceCalls).toBe(2);
  } finally {
    processing.release();
    await server.close();
  }
});

test('processes concurrent duplicates independently when idempotency is disabled', async ({
  request,
}) => {
  const processing = createGate();
  let acceptanceCalls = 0;
  const server = await startOrderApiServer({
    onOrderAccepted: async () => {
      acceptanceCalls++;
      await processing.promise;
    },
  });
  const order = OrderBuilder.create().build();

  try {
    const responses = await sendOverlappingRequests(request, server, order, processing.release);
    expect(responses.map((response) => response.status())).toEqual([201, 201]);
    const bodies = await Promise.all(responses.map((response) => response.json()));
    expect(bodies).toEqual([
      { orderId: order.orderId, correlationId: 'first-request', status: 'accepted' },
      { orderId: order.orderId, correlationId: 'duplicate-request', status: 'accepted' },
    ]);
    expect(acceptanceCalls).toBe(2);
  } finally {
    processing.release();
    await server.close();
  }
});

function createGate(): { promise: Promise<void>; release(): void } {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

async function sendOverlappingRequests(
  request: APIRequestContext,
  server: OrderApiServer,
  order: Order,
  release: () => void,
) {
  const requests = channel('http.server.request.start');
  const received = createGate();
  let receivedBodies = 0;
  const onRequest = (message: unknown): void => {
    const incoming = (message as { request: IncomingMessage }).request;
    if (incoming.headers.host !== new URL(server.baseUrl).host) return;
    incoming.once('end', () => {
      if (++receivedBodies === 2) {
        // Let both body-parsing continuations run while acceptance remains blocked.
        setImmediate(received.release);
      }
    });
  };
  requests.subscribe(onRequest);

  try {
    const responses = Promise.all(
      ['first-request', 'duplicate-request'].map((correlationId) =>
        request.post(`${server.baseUrl}/orders`, {
          data: order,
          headers: { 'x-correlation-id': correlationId },
        }),
      ),
    );
    await received.promise;
    release();
    return await responses;
  } finally {
    release();
    requests.unsubscribe(onRequest);
  }
}
