import { expect, test } from '@playwright/test';
import type { Consumer, Kafka } from 'kafkajs';

import { KafkaJsonConsumer } from '../../../app/src/kafka';
import { OrderCreatedEventBuilder } from '../builders/kafka/order-created-event-builder';
import type { OrderCreatedEvent } from '../builders/types';

const topic = 'orders.created.diagnostics';
const correlationId = 'consumer-diagnostics-correlation';

test('reports a useful timeout when no matching event arrives', async () => {
  const consumer = createConsumer(async () => undefined);
  const kafka = { consumer: () => consumer } as unknown as Kafka;
  const kafkaConsumer = new KafkaJsonConsumer(kafka, 'timeout-diagnostic-test');
  await kafkaConsumer.connect();

  await expect(
    kafkaConsumer.waitForMessage({ topic, correlationId, timeoutMs: 25 }),
  ).rejects.toThrow(
    `Timed out after 25ms waiting for a Kafka message on topic "${topic}" with correlation ID "${correlationId}".`,
  );

  await kafkaConsumer.disconnect();
});

test('accepts an event delivered after a short consumer delay', async () => {
  const event = OrderCreatedEventBuilder.create({ marker: 'delayed-consumer' })
    .withCorrelationId(correlationId)
    .build();
  const consumer = createConsumer(async (eachMessage) => {
    await Promise.resolve();
    await eachMessage({
      topic,
      partition: 0,
      message: {
        offset: '1',
        timestamp: '0',
        key: Buffer.from(event.payload.orderId),
        headers: { 'correlation-id': Buffer.from(correlationId) },
        value: Buffer.from(JSON.stringify(event)),
      },
    });
  });
  const kafka = { consumer: () => consumer } as unknown as Kafka;
  const kafkaConsumer = new KafkaJsonConsumer(kafka, 'delayed-consumer-test');
  await kafkaConsumer.connect();

  const received = await kafkaConsumer.waitForMessage<OrderCreatedEvent>({
    topic,
    correlationId,
    timeoutMs: 100,
  });

  expect(received.value).toEqual(event);
  await kafkaConsumer.disconnect();
});

test('cancels an in-flight wait when the consumer is disconnected', async () => {
  const consumer = createConsumer(async () => new Promise(() => undefined));
  const kafka = { consumer: () => consumer } as unknown as Kafka;
  const kafkaConsumer = new KafkaJsonConsumer(kafka, 'disconnect-diagnostic-test');
  await kafkaConsumer.connect();

  const received = kafkaConsumer.waitForMessage({ topic, correlationId, timeoutMs: 5_000 });
  await Promise.resolve();
  await kafkaConsumer.disconnect();

  await expect(received).rejects.toThrow(
    'Kafka consumer was disconnected while waiting for a message.',
  );
});

function createConsumer(
  run: (eachMessage: (payload: unknown) => Promise<void>) => Promise<void>,
): Consumer {
  return {
    connect: async () => undefined,
    disconnect: async () => undefined,
    stop: async () => undefined,
    subscribe: async () => undefined,
    run: async ({ eachMessage }: { eachMessage: (payload: unknown) => Promise<void> }) =>
      run(eachMessage),
  } as unknown as Consumer;
}
