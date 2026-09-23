import { randomUUID } from 'node:crypto';

import type { Consumer, Kafka, KafkaMessage } from 'kafkajs';

import type { ConsumedKafkaMessage, JsonValue } from '../types';

export interface WaitForKafkaMessageOptions<TValue extends JsonValue> {
  topic: string;
  correlationId?: string;
  key?: string;
  timeoutMs?: number;
  matcher?: (message: ConsumedKafkaMessage<TValue>) => boolean;
}

export class KafkaJsonConsumer {
  private readonly consumer: Consumer;
  private connected = false;
  private running = false;

  public constructor(kafka: Kafka, groupId = `pw-api-test-${randomUUID()}`) {
    this.consumer = kafka.consumer({ groupId });
  }

  public async connect(): Promise<void> {
    if (!this.connected) {
      await this.consumer.connect();
      this.connected = true;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connected) {
      await this.consumer.stop();
      await this.consumer.disconnect();
      this.connected = false;
      this.running = false;
    }
  }

  public async waitForMessage<TValue extends JsonValue>(
    options: WaitForKafkaMessageOptions<TValue>,
  ): Promise<ConsumedKafkaMessage<TValue>> {
    this.assertConnected();

    if (this.running) {
      throw new Error('KafkaJsonConsumer supports one wait operation per instance. Create a new consumer for another wait.');
    }

    this.running = true;
    // A fresh group plus correlation-ID filtering lets us read retained messages safely.
    // This prevents an event produced immediately after waitForMessage() is called from
    // being missed while the group is assigned partitions.
    await this.consumer.subscribe({ topic: options.topic, fromBeginning: true });

    const timeoutMs = options.timeoutMs ?? 15_000;
    const expectedDescription = describeExpectedMessage(options);

    return new Promise<ConsumedKafkaMessage<TValue>>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timed out after ${timeoutMs}ms waiting for ${expectedDescription}.`));
      }, timeoutMs);

      void this.consumer
        .run({
          eachMessage: async ({ topic, partition, message }) => {
            const candidate = parseKafkaMessage<TValue>(topic, partition, message);

            if (matches(candidate, options)) {
              clearTimeout(timeout);
              resolve(candidate);
            }
          },
        })
        .catch((error: unknown) => {
          clearTimeout(timeout);
          const reason = error instanceof Error ? error.message : String(error);
          reject(new Error(`Kafka consumer failed while waiting for ${expectedDescription}: ${reason}`));
        });
    });
  }

  private assertConnected(): void {
    if (!this.connected) {
      throw new Error('KafkaJsonConsumer is not connected. Call connect() before waitForMessage().');
    }
  }
}

function parseKafkaMessage<TValue extends JsonValue>(
  topic: string,
  partition: number,
  message: KafkaMessage,
): ConsumedKafkaMessage<TValue> {
  if (!message.value) {
    throw new Error(`Received an empty Kafka message on topic "${topic}".`);
  }

  try {
    return {
      metadata: {
        topic,
        partition,
        offset: message.offset,
        timestamp: message.timestamp,
        ...(message.key ? { key: message.key.toString('utf8') } : {}),
        headers: Object.fromEntries(
          Object.entries(message.headers ?? {}).map(([name, value]) => [
            name,
            value?.toString('utf8'),
          ]),
        ),
      },
      value: JSON.parse(message.value.toString('utf8')) as TValue,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not parse JSON Kafka message from topic "${topic}": ${reason}`);
  }
}

function matches<TValue extends JsonValue>(
  candidate: ConsumedKafkaMessage<TValue>,
  options: WaitForKafkaMessageOptions<TValue>,
): boolean {
  if (options.key && candidate.metadata.key !== options.key) {
    return false;
  }

  if (
    options.correlationId &&
    candidate.metadata.headers['correlation-id'] !== options.correlationId &&
    !hasCorrelationId(candidate.value, options.correlationId)
  ) {
    return false;
  }

  return options.matcher?.(candidate) ?? true;
}

function hasCorrelationId(value: JsonValue, expectedCorrelationId: string): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    value.correlationId === expectedCorrelationId
  );
}

function describeExpectedMessage<TValue extends JsonValue>(
  options: WaitForKafkaMessageOptions<TValue>,
): string {
  const filters = [
    `topic "${options.topic}"`,
    ...(options.key ? [`key "${options.key}"`] : []),
    ...(options.correlationId ? [`correlation ID "${options.correlationId}"`] : []),
  ];

  return `a Kafka message on ${filters.join(' with ')}`;
}
