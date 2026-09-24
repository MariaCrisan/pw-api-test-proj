import { createTestDataFaker, createTestMarker, type TestDataOptions } from '../../utils/faker';
import type { OrderRecord } from '../types';

export class OrderRecordBuilder {
  private record: OrderRecord;

  private constructor(options: TestDataOptions = {}) {
    const dataFaker = createTestDataFaker(options.seed);
    this.record = {
      order_id: dataFaker.string.uuid(),
      customer_id: dataFaker.string.uuid(),
      total: 49.99,
      currency: 'EUR',
      test_marker: options.marker ?? createTestMarker(),
    };
  }

  public static create(options: TestDataOptions = {}): OrderRecordBuilder {
    return new OrderRecordBuilder(options);
  }

  public forOrder(order: { orderId: string; customer: { customerId: string }; total: number; currency: string; testMarker: string }): this {
    this.record = {
      order_id: order.orderId,
      customer_id: order.customer.customerId,
      total: order.total,
      currency: order.currency,
      test_marker: order.testMarker,
    };
    return this;
  }

  public withOverrides(overrides: Partial<OrderRecord>): this {
    this.record = { ...this.record, ...overrides };
    return this;
  }

  public build(): OrderRecord {
    return { ...this.record };
  }
}
