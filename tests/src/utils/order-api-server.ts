import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import type { Order } from '../builders/types';

export interface OrderApiServer {
  baseUrl: string;
  close(): Promise<void>;
}

export interface OrderApiServerOptions {
  onOrderAccepted?: (order: Order, correlationId: string) => Promise<void>;
  requiredAuthorization?: string;
  idempotent?: boolean;
}

export async function startOrderApiServer(
  options: OrderApiServerOptions = {},
): Promise<OrderApiServer> {
  const acceptedOrders = new Map<string, { correlationId: string }>();
  const server = createServer(async (request, response) => {
    if (request.method !== 'POST' || request.url !== '/orders') {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }

    if (
      options.requiredAuthorization &&
      request.headers.authorization !== options.requiredAuthorization
    ) {
      sendJson(response, 401, { error: 'Unauthorized' });
      return;
    }

    try {
      const order = await readJsonBody(request);
      if (!isOrder(order)) {
        sendJson(response, 400, { error: 'Invalid order payload' });
        return;
      }

      const correlationId = request.headers['x-correlation-id']?.toString() ?? order.testMarker;
      const existingOrder = options.idempotent ? acceptedOrders.get(order.orderId) : undefined;
      if (existingOrder) {
        sendJson(response, 201, {
          orderId: order.orderId,
          correlationId: existingOrder.correlationId,
          status: 'accepted',
        });
        return;
      }

      await options.onOrderAccepted?.(order, correlationId);
      if (options.idempotent) acceptedOrders.set(order.orderId, { correlationId });
      sendJson(response, 201, { orderId: order.orderId, correlationId, status: 'accepted' });
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: 'Malformed JSON' });
        return;
      }
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : 'Order processing failed',
      });
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('The order API test server did not expose a TCP address.');
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => closeServer(server),
  };
}

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== 'object') return false;

  const order = value as Partial<Order>;
  return Boolean(
    order.orderId &&
    order.customer?.customerId &&
    order.customer.email &&
    order.items?.length &&
    order.currency &&
    typeof order.total === 'number' &&
    order.total >= 0 &&
    order.testMarker,
  );
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
