import { expect, test } from '@playwright/test';

import { OrderCreatedEventBuilder } from './kafka/order-created-event-builder';
import { OrderBuilder } from './api/order-builder';
import { OrderRecordBuilder } from './db/order-record-builder';
import { invalidOrder, validOrder } from '../fixtures';

test.describe('test data builders', () => {
  test('builds an order with deterministic seeded data', () => {
    const first = OrderBuilder.create({ seed: 2026, marker: 'seeded-test' }).build();
    const second = OrderBuilder.create({ seed: 2026, marker: 'seeded-test' }).build();

    expect(first).toEqual(second);
    expect(first.testMarker).toBe('seeded-test');
    expect(first.items).not.toHaveLength(0);
  });

  test('maps the same order into Kafka and database shapes', () => {
    const order = OrderBuilder.create({ seed: 7, marker: 'mapping-test' }).build();
    const event = OrderCreatedEventBuilder.create({ seed: 7 }).forOrder(order).build();
    const record = OrderRecordBuilder.create({ seed: 7 }).forOrder(order).build();

    expect(event.payload).toMatchObject({
      orderId: order.orderId,
      customerId: order.customer.customerId,
      total: order.total,
      testMarker: order.testMarker,
    });
    expect(record).toMatchObject({
      order_id: order.orderId,
      customer_id: order.customer.customerId,
      total: order.total,
      test_marker: order.testMarker,
    });
  });

  test('exports reusable static API fixtures', () => {
    expect(validOrder.items).toHaveLength(1);
    expect(validOrder.total).toBe(49.99);
    expect(invalidOrder.total).toBeLessThan(0);
  });
});
