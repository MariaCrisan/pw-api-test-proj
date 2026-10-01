import { expect, test } from '@playwright/test';

import { loadEnvironmentConfig } from '../../../app/src/config/environment';
import { KafkaJsonConsumer, KafkaJsonProducer } from '../../../app/src/kafka';
import { orderCreatedEventPayloadSchema } from '../../../app/src/schemas/kafka';
import { expectKafkaHeader, expectKafkaKey } from '../assertions/kafka/kafka-assertions';
import { expectSchema } from '../assertions/schema/schema-assertions';
import { OrderCreatedEventBuilder } from '../builders/kafka/order-created-event-builder';
import type { OrderCreatedEvent } from '../builders/types';
import {
  attachEnvironmentMetadata,
  attachKafkaMessage,
  attachSchemaResult,
} from '../reporting/attachments';
import {
  createIntegrationKafka,
  ensureKafkaTopic,
  runIntegrationTests,
} from '../utils/integration';

const topic = 'orders.created.integration';

test.describe('order-created Kafka integration', () => {
  test.skip(!runIntegrationTests, 'Set RUN_INTEGRATION_TESTS=true after starting Docker services.');

  test('produces and consumes a schema-valid correlated order event', async ({}, testInfo) => {
    const environment = loadEnvironmentConfig();
    const kafka = createIntegrationKafka(environment.kafka.brokers);
    await ensureKafkaTopic(kafka, topic);

    const event = OrderCreatedEventBuilder.create({ seed: 99, marker: 'kafka-integration' })
      .withCorrelationId('kafka-integration-correlation')
      .build();
    await attachEnvironmentMetadata(testInfo, environment, event.correlationId);
    const producer = new KafkaJsonProducer(kafka);
    const consumer = new KafkaJsonConsumer(kafka);
    await producer.connect();
    await consumer.connect();

    try {
      const consumedEvent = consumer.waitForMessage<OrderCreatedEvent>({
        topic,
        key: event.payload.orderId,
        correlationId: event.correlationId,
        timeoutMs: environment.assertions.timeoutMs,
      });
      await test.step('Produce correlated order-created event', () =>
        producer.send(topic, {
          key: event.payload.orderId,
          value: event,
          headers: { 'correlation-id': event.correlationId },
        }));

      const message = await test.step('Await correlated Kafka event', () => consumedEvent);
      await attachKafkaMessage(testInfo, message);
      await attachSchemaResult(testInfo, 'order.created payload', message.value.payload);
      expectKafkaKey(message, event.payload.orderId);
      expectKafkaHeader(message, 'correlation-id', event.correlationId);
      expect(message.value).toEqual(event);
      expectSchema(message.value.payload, orderCreatedEventPayloadSchema, 'order.created payload');
    } finally {
      await Promise.all([producer.disconnect(), consumer.disconnect()]);
    }
  });
});
