import { EventEmitter } from 'node:events';

import { expect, test } from '@playwright/test';
import type { Consumer, ConsumerCrashEvent, Kafka } from 'kafkajs';

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
  expect(consumer.crashListenerCount()).toBe(0);

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
  expect(consumer.crashListenerCount()).toBe(0);
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
  expect(consumer.crashListenerCount()).toBe(0);
});

test('reports malformed messages delivered after the consumer starts', async () => {
  const consumer = createConsumer(async () => undefined);
  const kafkaConsumer = new KafkaJsonConsumer({ consumer: () => consumer } as unknown as Kafka);
  await kafkaConsumer.connect();

  try {
    const received = kafkaConsumer.waitForMessage({ topic, correlationId, timeoutMs: 100 });
    const failure = expect(received).rejects.toThrow(
      `Could not parse JSON Kafka message from topic "${topic}"`,
    );
    await consumer.started;
    await expect(consumer.deliver(createMessage('{invalid-json'))).rejects.toThrow(
      'Could not parse JSON Kafka message',
    );
    await failure;
    expect(consumer.crashListenerCount()).toBe(0);
  } finally {
    await kafkaConsumer.disconnect();
  }
});

test('preserves matcher errors delivered after the consumer starts', async () => {
  const consumer = createConsumer(async () => undefined);
  const kafkaConsumer = new KafkaJsonConsumer({ consumer: () => consumer } as unknown as Kafka);
  const matcherError = new Error('Order event matcher failed');
  await kafkaConsumer.connect();

  try {
    const received = kafkaConsumer.waitForMessage({
      topic,
      timeoutMs: 100,
      matcher: () => {
        throw matcherError;
      },
    });
    const failure = expect(received).rejects.toMatchObject({
      message: expect.stringContaining('Order event matcher failed'),
      cause: matcherError,
    });
    await consumer.started;
    await expect(consumer.deliver(createMessage('{}'))).rejects.toBe(matcherError);
    await failure;
    expect(consumer.crashListenerCount()).toBe(0);
  } finally {
    await kafkaConsumer.disconnect();
  }
});

test('reports a consumer crash after startup with its original cause', async () => {
  const consumer = createConsumer(async () => undefined);
  const kafkaConsumer = new KafkaJsonConsumer({ consumer: () => consumer } as unknown as Kafka);
  const crashError = new Error('Kafka broker connection lost');
  await kafkaConsumer.connect();

  try {
    const received = kafkaConsumer.waitForMessage({ topic, correlationId, timeoutMs: 100 });
    const failure = expect(received).rejects.toMatchObject({
      message: `Kafka consumer failed while waiting for a Kafka message on topic "${topic}" with correlation ID "${correlationId}": ${crashError.message}`,
      cause: crashError,
    });
    await consumer.started;
    consumer.emitCrash(crashError);
    await failure;
    expect(consumer.crashListenerCount()).toBe(0);
  } finally {
    await kafkaConsumer.disconnect();
  }
});

test('preserves consumer startup failures and removes the crash listener', async () => {
  const startupError = new Error('Kafka consumer startup failed');
  const consumer = createConsumer(async () => {
    throw startupError;
  });
  const kafkaConsumer = new KafkaJsonConsumer({ consumer: () => consumer } as unknown as Kafka);
  await kafkaConsumer.connect();

  try {
    await expect(kafkaConsumer.waitForMessage({ topic, timeoutMs: 100 })).rejects.toMatchObject({
      message: expect.stringContaining(startupError.message),
      cause: startupError,
    });
    expect(consumer.crashListenerCount()).toBe(0);
  } finally {
    await kafkaConsumer.disconnect();
  }
});

interface TestConsumer extends Consumer {
  started: Promise<void>;
  deliver(payload: unknown): Promise<void>;
  emitCrash(error: Error): void;
  crashListenerCount(): number;
}

function createConsumer(
  run: (eachMessage: (payload: unknown) => Promise<void>) => Promise<void>,
): TestConsumer {
  const events = new EventEmitter();
  let deliver!: (payload: unknown) => Promise<void>;
  let markStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });

  return {
    connect: async () => undefined,
    disconnect: async () => undefined,
    stop: async () => undefined,
    subscribe: async () => undefined,
    events: { CRASH: 'consumer.crash' },
    on: (event: string, listener: (event: ConsumerCrashEvent) => void) => {
      events.on(event, listener);
      return () => events.off(event, listener);
    },
    started,
    deliver: (payload: unknown) => deliver(payload),
    emitCrash: (error: Error) => events.emit('consumer.crash', { payload: { error } }),
    crashListenerCount: () => events.listenerCount('consumer.crash'),
    run: async ({ eachMessage }: { eachMessage: (payload: unknown) => Promise<void> }) => {
      deliver = eachMessage;
      markStarted();
      await run(eachMessage);
    },
  } as unknown as TestConsumer;
}

function createMessage(value: string): unknown {
  return {
    topic,
    partition: 0,
    message: { offset: '1', timestamp: '0', value: Buffer.from(value) },
  };
}
