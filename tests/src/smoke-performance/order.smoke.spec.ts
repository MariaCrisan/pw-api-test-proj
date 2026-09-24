import { expect, test } from '@playwright/test';

import { OrderBuilder } from '../builders/api/order-builder';
import { startOrderApiServer, type OrderApiServer } from '../utils/order-api-server';

const responseThresholdMs = 1_000;
let orderApi: OrderApiServer;

test.beforeAll(async () => {
  orderApi = await startOrderApiServer();
});

test.afterAll(async () => {
  await orderApi.close();
});

test('accepts an order within the smoke latency threshold', async ({ request }) => {
  const order = OrderBuilder.create({ seed: 400, marker: 'smoke' }).build();
  const startedAt = performance.now();
  const response = await request.post(`${orderApi.baseUrl}/orders`, { data: order });
  const durationMs = performance.now() - startedAt;

  expect(response.status()).toBe(201);
  expect(durationMs).toBeLessThan(responseThresholdMs);
});
