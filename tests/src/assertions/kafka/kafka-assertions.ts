import { expect } from '@playwright/test';

import type { ConsumedKafkaMessage, JsonValue } from '../../../../app/src/kafka/types';

export function expectKafkaKey<TValue extends JsonValue>(
  message: ConsumedKafkaMessage<TValue>,
  key: string,
): void {
  expect(message.metadata.key).toBe(key);
}

export function expectKafkaHeader<TValue extends JsonValue>(
  message: ConsumedKafkaMessage<TValue>,
  name: string,
  value: string,
): void {
  expect(message.metadata.headers[name]).toBe(value);
}
