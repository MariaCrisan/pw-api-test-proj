import { expect, test } from '@playwright/test';

import {
  orderCreatedResponseSchema,
  type OrderCreatedResponse,
} from '../../../app/src/schemas/api';
import { orderCreatedEventPayloadSchema } from '../../../app/src/schemas/kafka';
import { expectSchema } from '../assertions/schema/schema-assertions';
import { OrderBuilder } from '../builders/api/order-builder';
import { OrderCreatedEventBuilder } from '../builders/kafka/order-created-event-builder';
import { startOrderApiServer, type OrderApiServer } from '../utils/order-api-server';

let orderApi: OrderApiServer;

test.beforeAll(async () => {
  orderApi = await startOrderApiServer();
});

test.afterAll(async () => {
  await orderApi.close();
});

test('REST create-order response adheres to its contract', async ({ request }) => {
  const order = OrderBuilder.create({ seed: 100, marker: 'rest-contract' }).build();
  const response = await request.post(`${orderApi.baseUrl}/orders`, { data: order });
  const body: unknown = await response.json();

  expect(response.status()).toBe(201);
  expectSchema<OrderCreatedResponse>(body, orderCreatedResponseSchema, 'create-order response');
});

test('Kafka order-created payload adheres to its contract', () => {
  const order = OrderBuilder.create({ seed: 101, marker: 'kafka-contract' }).build();
  const event = OrderCreatedEventBuilder.create().forOrder(order).build();

  expectSchema(event.payload, orderCreatedEventPayloadSchema, 'order.created payload');
});
