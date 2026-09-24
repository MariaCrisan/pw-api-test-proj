import { expect, test } from '@playwright/test';

import { OrderBuilder } from '../builders/api/order-builder';
import { startOrderApiServer, type OrderApiServer } from '../utils/order-api-server';

let orderApi: OrderApiServer;
let acceptedOrders: string[];

test.beforeAll(async () => {
  acceptedOrders = [];
  orderApi = await startOrderApiServer({
    idempotent: true,
    onOrderAccepted: async (order) => {
      acceptedOrders.push(order.orderId);
    },
  });
});

test.afterAll(async () => {
  await orderApi.close();
});

test('processes a duplicate request only once', async ({ request }) => {
  const order = OrderBuilder.create({ seed: 300, marker: 'idempotency' }).build();
  const requestOptions = {
    data: order,
    headers: { 'x-correlation-id': `${order.testMarker}-correlation` },
  };

  const first = await request.post(`${orderApi.baseUrl}/orders`, requestOptions);
  const retry = await request.post(`${orderApi.baseUrl}/orders`, requestOptions);

  expect(first.status()).toBe(201);
  expect(retry.status()).toBe(201);
  await expect(retry.json()).resolves.toEqual(await first.json());
  expect(acceptedOrders).toEqual([order.orderId]);
});
