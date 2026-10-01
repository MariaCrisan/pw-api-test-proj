import { expect, test } from '@playwright/test';

import { ApiClient } from '../../../app/src/clients/api/api-client';
import {
  orderCreatedResponseSchema,
  type OrderCreatedResponse,
} from '../../../app/src/schemas/api';
import { expectSchema } from '../assertions/schema/schema-assertions';
import { OrderBuilder } from '../builders/api/order-builder';
import { invalidOrder } from '../fixtures';
import { attachApiExchange, attachSchemaResult } from '../reporting/attachments';
import { startOrderApiServer, type OrderApiServer } from '../utils/order-api-server';

let orderApi: OrderApiServer;

test.beforeAll(async () => {
  orderApi = await startOrderApiServer();
});

test.afterAll(async () => {
  await orderApi.close();
});

test('accepts a valid order and returns a schema-valid response', async ({
  playwright,
}, testInfo) => {
  const requestContext = await playwright.request.newContext({ baseURL: orderApi.baseUrl });
  const apiClient = new ApiClient(requestContext);
  const order = OrderBuilder.create({ seed: 42, marker: 'api-happy-path' }).build();
  const correlationId = `${order.testMarker}-correlation`;

  const response = await test.step('Submit valid order', () =>
    apiClient.post('/orders', order, {
      headers: { 'x-correlation-id': correlationId },
    }));
  const body: unknown = await response.json();
  await attachApiExchange(
    testInfo,
    {
      method: 'POST',
      url: `${orderApi.baseUrl}/orders`,
      headers: { 'x-correlation-id': correlationId },
      body: order,
    },
    response,
  );
  await attachSchemaResult(testInfo, 'create-order response', body);

  expect(response.status()).toBe(201);
  expectSchema<OrderCreatedResponse>(body, orderCreatedResponseSchema, 'create-order response');
  expect(body).toEqual({ orderId: order.orderId, correlationId, status: 'accepted' });

  await requestContext.dispose();
});

test('rejects an invalid order payload', async ({ playwright }) => {
  const requestContext = await playwright.request.newContext({ baseURL: orderApi.baseUrl });
  const apiClient = new ApiClient(requestContext);

  const response = await apiClient.post('/orders', invalidOrder);

  expect(response.status()).toBe(400);
  await expect(response).not.toBeOK();
  await expect(response.json()).resolves.toEqual({ error: 'Invalid order payload' });

  await requestContext.dispose();
});
