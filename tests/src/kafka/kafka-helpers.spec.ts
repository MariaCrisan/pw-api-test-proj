import { test, expect } from '@playwright/test';
import type { Consumer, Kafka, Producer } from 'kafkajs';

import {
  createKafkaEventEnvelope,
  KafkaJsonConsumer,
  KafkaJsonProducer,
  loadKafkaConnectionConfig,
} from '../../../kafka';

test.describe('Kafka helpers', () => {
  test('loads broker and SASL configuration from environment variables', () => {
    const config = loadKafkaConnectionConfig({
      KAFKA_BROKERS: 'kafka-a:9092, kafka-b:9092',
      KAFKA_CLIENT_ID: 'framework-tests',
      KAFKA_SSL: 'true',
      KAFKA_SASL_MECHANISM: 'plain',
      KAFKA_SASL_USERNAME: 'test-user',
      KAFKA_SASL_PASSWORD: 'test-password',
    });

    expect(config).toMatchObject({
      brokers: ['kafka-a:9092', 'kafka-b:9092'],
      clientId: 'framework-tests',
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: 'test-user',
        password: 'test-password',
      },
    });
  });

  test('rejects incomplete SASL configuration', () => {
    expect(() =>
      loadKafkaConnectionConfig({
        KAFKA_SASL_MECHANISM: 'plain',
        KAFKA_SASL_USERNAME: 'test-user',
      }),
    ).toThrow('KAFKA_SASL_USERNAME and KAFKA_SASL_PASSWORD are required');
  });

  test('creates a versioned event envelope with generated identifiers', () => {
    const event = createKafkaEventEnvelope(
      'order.created',
      { orderId: 'order-123' },
      { correlationId: 'correlation-123', version: '2' },
    );

    expect(event).toMatchObject({
      eventType: 'order.created',
      correlationId: 'correlation-123',
      version: '2',
      payload: { orderId: 'order-123' },
    });
    expect(event.eventId).not.toBe('');
    expect(new Date(event.occurredAt).toString()).not.toBe('Invalid Date');
  });

  test('sends JSON messages after connecting the producer', async () => {
    const send = async (record: unknown) => {
      expect(record).toMatchObject({
        topic: 'orders.created',
        acks: -1,
        messages: [
          {
            key: 'order-123',
            value: JSON.stringify({ orderId: 'order-123' }),
            headers: { 'correlation-id': 'correlation-123' },
          },
        ],
      });

      return [{ partition: 1, baseOffset: '42' }];
    };
    const producer = {
      connect: async () => undefined,
      disconnect: async () => undefined,
      send,
    } as unknown as Producer;
    const kafka = {
      producer: () => producer,
    } as unknown as Kafka;
    const kafkaProducer = new KafkaJsonProducer(kafka);

    await expect(
      kafkaProducer.send('orders.created', { value: { orderId: 'order-123' } }),
    ).rejects.toThrow('KafkaJsonProducer is not connected');

    await kafkaProducer.connect();
    const records = await kafkaProducer.send('orders.created', {
      key: 'order-123',
      value: { orderId: 'order-123' },
      headers: { 'correlation-id': 'correlation-123' },
    });

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ topic: 'orders.created', partition: 1, offset: '42' });
  });

  test('waits for a matching correlated JSON message', async () => {
    const consumer = {
      connect: async () => undefined,
      disconnect: async () => undefined,
      stop: async () => undefined,
      subscribe: async () => undefined,
      run: async ({ eachMessage }: { eachMessage: (payload: unknown) => Promise<void> }) => {
        await eachMessage({
          topic: 'orders.created',
          partition: 0,
          message: {
            offset: '11',
            timestamp: '1710000000000',
            key: Buffer.from('order-123'),
            headers: { 'correlation-id': Buffer.from('correlation-123') },
            value: Buffer.from(JSON.stringify({ orderId: 'order-123' })),
          },
        });
      },
    } as unknown as Consumer;
    const kafka = {
      consumer: () => consumer,
    } as unknown as Kafka;
    const kafkaConsumer = new KafkaJsonConsumer(kafka, 'kafka-helper-test');

    await expect(
      kafkaConsumer.waitForMessage({ topic: 'orders.created' }),
    ).rejects.toThrow('KafkaJsonConsumer is not connected');

    await kafkaConsumer.connect();
    const received = await kafkaConsumer.waitForMessage<{ orderId: string }>({
      topic: 'orders.created',
      key: 'order-123',
      correlationId: 'correlation-123',
    });

    expect(received).toMatchObject({
      metadata: {
        topic: 'orders.created',
        partition: 0,
        offset: '11',
        key: 'order-123',
        headers: { 'correlation-id': 'correlation-123' },
      },
      value: { orderId: 'order-123' },
    });

    await kafkaConsumer.disconnect();
  });
});
