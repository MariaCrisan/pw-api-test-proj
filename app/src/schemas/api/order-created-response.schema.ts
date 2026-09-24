import type { JSONSchemaType } from 'ajv';

export interface OrderCreatedResponse {
  orderId: string;
  correlationId: string;
  status: 'accepted';
}

export const orderCreatedResponseSchema: JSONSchemaType<OrderCreatedResponse> = {
  type: 'object',
  properties: {
    orderId: { type: 'string', minLength: 1 },
    correlationId: { type: 'string', minLength: 1 },
    status: { type: 'string', enum: ['accepted'] },
  },
  required: ['orderId', 'correlationId', 'status'],
  additionalProperties: false,
};
