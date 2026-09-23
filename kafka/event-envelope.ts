import { randomUUID } from 'node:crypto';

import type { JsonValue, KafkaEventEnvelope } from './types';

export function createKafkaEventEnvelope<TPayload extends JsonValue>(
  eventType: string,
  payload: TPayload,
  options: Partial<Pick<KafkaEventEnvelope<TPayload>, 'eventId' | 'correlationId' | 'occurredAt' | 'version'>> = {},
): KafkaEventEnvelope<TPayload> {
  if (!eventType.trim()) {
    throw new Error('eventType must not be empty.');
  }

  return {
    eventId: options.eventId ?? randomUUID(),
    eventType,
    occurredAt: options.occurredAt ?? new Date().toISOString(),
    correlationId: options.correlationId ?? randomUUID(),
    version: options.version ?? '1',
    payload,
  };
}
