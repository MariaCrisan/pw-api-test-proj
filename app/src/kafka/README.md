# Kafka test helpers

This folder provides the initial KafkaJS-based framework layer for JSON messages.

## Defaults

- Brokers come from `KAFKA_BROKERS` (default: `localhost:9092`).
- SASL is enabled only when `KAFKA_SASL_MECHANISM` is configured; credentials are always read from environment variables.
- Producers require explicit `connect()` and use full acknowledgements.
- Consumers use a generated group ID, read retained messages with correlation-ID filtering, and have a 15-second default timeout.
- A message can be filtered by key, a `correlation-id` header, or an envelope-level `correlationId`.

## Intended usage

```ts
const kafka = createKafkaClient(loadKafkaConnectionConfig());
const producer = new KafkaJsonProducer(kafka);
const consumer = new KafkaJsonConsumer(kafka);

await producer.connect();
await consumer.connect();

const event = createKafkaEventEnvelope('order.created', { orderId: 'order-123' });
const received = consumer.waitForMessage({
  topic: process.env.KAFKA_ORDER_CREATED_TOPIC!,
  correlationId: event.correlationId,
});

await producer.send(process.env.KAFKA_ORDER_CREATED_TOPIC!, {
  key: event.payload.orderId,
  value: event,
  headers: { 'correlation-id': event.correlationId },
});

await received;
await consumer.disconnect();
await producer.disconnect();
```

Install dependencies with `npm install` before compiling these helpers. The TypeScript/Playwright scaffold is available; Kafka broker integration tests are the next Kafka milestone.
