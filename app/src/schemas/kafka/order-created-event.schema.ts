import type { JSONSchemaType } from 'ajv';

export interface OrderCreatedEventPayload {
  orderId: string;
  customerId: string;
  total: number;
  currency: string;
  testMarker: string;
}

export const orderCreatedEventPayloadSchema: JSONSchemaType<OrderCreatedEventPayload> = {
  type: 'object',
  properties: {
    orderId: { type: 'string', minLength: 1 },
    customerId: { type: 'string', minLength: 1 },
    total: { type: 'number', minimum: 0 },
    currency: { type: 'string', minLength: 3 },
    testMarker: { type: 'string', minLength: 1 },
  },
  required: ['orderId', 'customerId', 'total', 'currency', 'testMarker'],
  additionalProperties: false,
};
