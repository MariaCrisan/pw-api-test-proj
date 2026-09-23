export type JsonValue =
  | boolean
  | number
  | string
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface KafkaEventEnvelope<TPayload extends JsonValue = JsonValue> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  correlationId: string;
  version: string;
  payload: TPayload;
}

export interface KafkaMessageMetadata {
  topic: string;
  partition: number;
  offset: string;
  timestamp: string;
  key?: string;
  headers: Record<string, string | undefined>;
}

export interface ConsumedKafkaMessage<TValue extends JsonValue = JsonValue> {
  metadata: KafkaMessageMetadata;
  value: TValue;
}

export interface ProduceJsonMessage<TValue extends JsonValue = JsonValue> {
  key?: string;
  value: TValue;
  headers?: Record<string, string | Buffer | undefined>;
}

export interface ProducedKafkaMessage {
  topic: string;
  partition: number;
  offset: string;
  timestamp: string;
}
