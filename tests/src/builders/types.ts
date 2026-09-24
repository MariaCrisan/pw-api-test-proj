import type { KafkaEventEnvelope } from '../../../app/src/kafka/types';

export interface Customer {
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface OrderItem {
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  currency: string;
  total: number;
  testMarker: string;
}

export type OrderCreatedPayload = {
  orderId: string;
  customerId: string;
  total: number;
  currency: string;
  testMarker: string;
};

export type OrderCreatedEvent = KafkaEventEnvelope<OrderCreatedPayload>;

export interface OrderRecord {
  order_id: string;
  customer_id: string;
  total: number;
  currency: string;
  test_marker: string;
}
