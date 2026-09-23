import { createServer, type Server } from 'node:http';

import { expect, test } from '@playwright/test';

import { ApiClient } from '../../../app/src/clients/api/api-client';

let server: Server;
let baseUrl: string;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    response.writeHead(404, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ error: 'Not found' }));
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('The local REST test server did not expose a TCP address.');
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('returns a healthy response through the reusable API client', async ({ playwright }) => {
  const requestContext = await playwright.request.newContext({ baseURL: baseUrl });
  const apiClient = new ApiClient(requestContext);

  const response = await apiClient.get('/health');

  expect(response.status()).toBe(200);
  await expect(response).toBeOK();
  await expect(response.json()).resolves.toEqual({ status: 'ok' });

  await requestContext.dispose();
});
