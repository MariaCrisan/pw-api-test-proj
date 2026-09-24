import { createKafkaEventEnvelope } from '../../../../app/src/kafka/event-envelope';
import type { KafkaEventEnvelope } from '../../../../app/src/kafka/types';
import type { OrderCreatedEvent, OrderCreatedPayload } from '../types';
import type { TestDataOptions } from '../../utils/faker';
import { createTestDataFaker } from '../../utils/faker';

export class OrderCreatedEventBuilder {
  private readonly faker;
  private payload: OrderCreatedPayload;
  private options: Partial<
    Pick<KafkaEventEnvelope<OrderCreatedPayload>, 'eventId' | 'correlationId' | 'occurredAt' | 'version'>
  > = {};

  private constructor(options: TestDataOptions = {}) {
    this.faker = createTestDataFaker(options.seed);
    this.payload = {
      orderId: this.faker.string.uuid(),
      customerId: this.faker.string.uuid(),
      total: 49.99,
      currency: 'EUR',
      testMarker: options.marker ?? `event-${this.faker.string.alphanumeric(10)}`,
    };
  }

  public static create(options: TestDataOptions = {}): OrderCreatedEventBuilder {
    return new OrderCreatedEventBuilder(options);
  }

  public forOrder(order: { orderId: string; customer: { customerId: string }; total: number; currency: string; testMarker: string }): this {
    this.payload = {
      ...this.payload,
      orderId: order.orderId,
      customerId: order.customer.customerId,
      total: order.total,
      currency: order.currency,
      testMarker: order.testMarker,
    };
    return this;
  }

  public withPayload(payload: Partial<OrderCreatedPayload>): this {
    this.payload = { ...this.payload, ...payload };
    return this;
  }

  public withCorrelationId(correlationId: string): this {
    this.options = { ...this.options, correlationId };
    return this;
  }

  public withEventId(eventId: string): this {
    this.options = { ...this.options, eventId };
    return this;
  }

  public build(): OrderCreatedEvent {
    return createKafkaEventEnvelope('order.created', { ...this.payload }, this.options);
  }
}
