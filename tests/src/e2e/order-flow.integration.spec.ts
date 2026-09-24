import { expect, test } from '@playwright/test';
import type { QueryResultRow } from 'pg';

import { ApiClient } from '../../../app/src/clients/api/api-client';
import { PostgresClient } from '../../../app/src/clients/db';
import { loadEnvironmentConfig } from '../../../app/src/config/environment';
import { queryOne } from '../../../app/src/db/queries';
import { cleanupByMarker } from '../../../app/src/db/transactions';
import { KafkaJsonConsumer, KafkaJsonProducer } from '../../../app/src/kafka';
import { poll } from '../../../app/src/utils/polling';
import { expectKafkaHeader, expectKafkaKey } from '../assertions/kafka/kafka-assertions';
import { OrderBuilder } from '../builders/api/order-builder';
import { OrderCreatedEventBuilder } from '../builders/kafka/order-created-event-builder';
import type { OrderCreatedEvent, OrderRecord } from '../builders/types';
import {
  createIntegrationKafka,
  ensureKafkaTopic,
  runIntegrationTests,
} from '../utils/integration';
import { startOrderApiServer, type OrderApiServer } from '../utils/order-api-server';

const topic = 'orders.created.integration';

test.describe('order API to Kafka to PostgreSQL flow', () => {
  test.skip(!runIntegrationTests, 'Set RUN_INTEGRATION_TESTS=true after starting Docker services.');

  test('persists and publishes the accepted order exactly once', async ({ playwright }) => {
    const environment = loadEnvironmentConfig();
    const kafka = createIntegrationKafka(environment.kafka.brokers);
    const database = new PostgresClient(environment.postgres);
    const producer = new KafkaJsonProducer(kafka);
    const consumer = new KafkaJsonConsumer(kafka);
    const order = OrderBuilder.create({ marker: 'e2e-order' }).build();
    const correlationId = `${order.testMarker}-correlation`;
    let orderApi: OrderApiServer | undefined;

    await ensureKafkaTopic(kafka, topic);
    await database.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id UUID PRIMARY KEY,
        customer_id UUID NOT NULL,
        total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
        currency TEXT NOT NULL,
        test_marker TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await producer.connect();
    await consumer.connect();

    try {
      orderApi = await startOrderApiServer({
        onOrderAccepted: async (acceptedOrder, acceptedCorrelationId) => {
          const event = OrderCreatedEventBuilder.create()
            .forOrder(acceptedOrder)
            .withCorrelationId(acceptedCorrelationId)
            .build();
          await producer.send(topic, {
            key: event.payload.orderId,
            value: event,
            headers: { 'correlation-id': event.correlationId },
          });
          await database.query(
            `INSERT INTO orders (order_id, customer_id, total, currency, test_marker)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              acceptedOrder.orderId,
              acceptedOrder.customer.customerId,
              acceptedOrder.total,
              acceptedOrder.currency,
              acceptedOrder.testMarker,
            ],
          );
        },
      });
      const requestContext = await playwright.request.newContext({ baseURL: orderApi.baseUrl });
      const apiClient = new ApiClient(requestContext);
      const consumedEvent = consumer.waitForMessage<OrderCreatedEvent>({
        topic,
        key: order.orderId,
        correlationId,
        timeoutMs: environment.assertions.timeoutMs,
      });

      const response = await apiClient.post('/orders', order, {
        headers: { 'x-correlation-id': correlationId },
      });
      expect(response.status()).toBe(201);

      const message = await consumedEvent;
      expectKafkaKey(message, order.orderId);
      expectKafkaHeader(message, 'correlation-id', correlationId);
      expect(message.value.payload).toMatchObject({
        orderId: order.orderId,
        testMarker: order.testMarker,
      });

      const record = await poll(
        async () =>
          queryOne<OrderRecord>(
            database,
            'SELECT order_id, customer_id, total::float8 AS total, currency, test_marker FROM orders WHERE order_id = $1',
            [order.orderId],
          ),
        {
          timeoutMs: environment.assertions.timeoutMs,
          intervalMs: environment.assertions.pollIntervalMs,
          description: `order ${order.orderId} in PostgreSQL`,
        },
      );
      expect(record).toEqual({
        order_id: order.orderId,
        customer_id: order.customer.customerId,
        total: order.total,
        currency: order.currency,
        test_marker: order.testMarker,
      });

      const count = await queryOne<QueryResultRow & { count: number }>(
        database,
        'SELECT COUNT(*)::int AS count FROM orders WHERE test_marker = $1',
        [order.testMarker],
      );
      expect(count?.count).toBe(1);
      await requestContext.dispose();
    } finally {
      if (orderApi) await orderApi.close();
      await database.withTransaction((client) =>
        cleanupByMarker(client, 'orders', 'test_marker', order.testMarker),
      );
      await Promise.all([producer.disconnect(), consumer.disconnect()]);
      await database.close();
    }
  });
});
