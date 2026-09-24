import { expect, test } from '@playwright/test';

import { loadEnvironmentConfig } from '../../../app/src/config/environment';
import { KafkaJsonConsumer, KafkaJsonProducer } from '../../../app/src/kafka';
import { orderCreatedEventPayloadSchema } from '../../../app/src/schemas/kafka';
import { expectKafkaHeader, expectKafkaKey } from '../assertions/kafka/kafka-assertions';
import { expectSchema } from '../assertions/schema/schema-assertions';
import { OrderCreatedEventBuilder } from '../builders/kafka/order-created-event-builder';
import type { OrderCreatedEvent } from '../builders/types';
import {
  createIntegrationKafka,
  ensureKafkaTopic,
  runIntegrationTests,
} from '../utils/integration';

const topic = 'orders.created.integration';

test.describe('order-created Kafka integration', () => {
  test.skip(!runIntegrationTests, 'Set RUN_INTEGRATION_TESTS=true after starting Docker services.');

  test('produces and consumes a schema-valid correlated order event', async () => {
    const environment = loadEnvironmentConfig();
    const kafka = createIntegrationKafka(environment.kafka.brokers);
    await ensureKafkaTopic(kafka, topic);

    const event = OrderCreatedEventBuilder.create({ seed: 99, marker: 'kafka-integration' })
      .withCorrelationId('kafka-integration-correlation')
      .build();
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
      await producer.send(topic, {
        key: event.payload.orderId,
        value: event,
        headers: { 'correlation-id': event.correlationId },
      });

      const message = await consumedEvent;
      expectKafkaKey(message, event.payload.orderId);
      expectKafkaHeader(message, 'correlation-id', event.correlationId);
      expect(message.value).toEqual(event);
      expectSchema(message.value.payload, orderCreatedEventPayloadSchema, 'order.created payload');
    } finally {
      await Promise.all([producer.disconnect(), consumer.disconnect()]);
    }
  });
});
