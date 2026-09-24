import { expect, test } from '@playwright/test';

import { OrderBuilder } from '../builders/api/order-builder';
import { startOrderApiServer, type OrderApiServer } from '../utils/order-api-server';

const authorization = 'Bearer phase-five-test-token';
let orderApi: OrderApiServer;

test.beforeAll(async () => {
  orderApi = await startOrderApiServer({ requiredAuthorization: authorization });
});

test.afterAll(async () => {
  await orderApi.close();
});

test('rejects a payload with a required field missing', async ({ request }) => {
  const order = OrderBuilder.create({
    seed: 200,
    marker: 'negative-missing-field',
  }).build();
  const orderWithoutCustomer = structuredClone(order);
  Reflect.deleteProperty(orderWithoutCustomer, 'customer');

  const response = await request.post(`${orderApi.baseUrl}/orders`, {
    data: orderWithoutCustomer,
    headers: { authorization },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toEqual({ error: 'Invalid order payload' });
});

test('rejects requests without authorization', async ({ request }) => {
  const order = OrderBuilder.create({ seed: 201, marker: 'negative-auth' }).build();
  const response = await request.post(`${orderApi.baseUrl}/orders`, { data: order });

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
});

test('rejects malformed JSON before processing the request', async () => {
  const response = await fetch(`${orderApi.baseUrl}/orders`, {
    method: 'POST',
    headers: { authorization, 'content-type': 'application/json' },
    body: '{ invalid-json',
  });

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({ error: 'Malformed JSON' });
});
