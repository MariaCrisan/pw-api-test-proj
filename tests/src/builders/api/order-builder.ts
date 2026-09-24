import { createTestDataFaker, createTestMarker, type TestDataOptions } from '../../utils/faker';
import type { Customer, Order, OrderItem } from '../types';

export class OrderBuilder {
  private readonly faker;
  private order: Order;

  private constructor(options: TestDataOptions = {}) {
    this.faker = createTestDataFaker(options.seed);
    const customer: Customer = {
      customerId: this.faker.string.uuid(),
      email: this.faker.internet.email(),
      firstName: this.faker.person.firstName(),
      lastName: this.faker.person.lastName(),
    };
    const item: OrderItem = {
      sku: `SKU-${this.faker.string.alphanumeric({ length: 8, casing: 'upper' })}`,
      quantity: 1,
      unitPrice: 49.99,
    };

    this.order = {
      orderId: this.faker.string.uuid(),
      customer,
      items: [item],
      currency: 'EUR',
      total: item.quantity * item.unitPrice,
      testMarker: options.marker ?? createTestMarker(),
    };
  }

  public static create(options: TestDataOptions = {}): OrderBuilder {
    return new OrderBuilder(options);
  }

  public withOrderId(orderId: string): this {
    this.order.orderId = orderId;
    return this;
  }

  public withCustomer(customer: Partial<Customer>): this {
    this.order.customer = { ...this.order.customer, ...customer };
    return this;
  }

  public withItems(items: OrderItem[]): this {
    this.order.items = items.map((item) => ({ ...item }));
    this.order.total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return this;
  }

  public withCurrency(currency: string): this {
    this.order.currency = currency;
    return this;
  }

  public withMarker(testMarker: string): this {
    this.order.testMarker = testMarker;
    return this;
  }

  public withOverrides(overrides: Partial<Order>): this {
    this.order = { ...this.order, ...overrides };
    return this;
  }

  public build(): Order {
    return {
      ...this.order,
      customer: { ...this.order.customer },
      items: this.order.items.map((item) => ({ ...item })),
    };
  }
}
