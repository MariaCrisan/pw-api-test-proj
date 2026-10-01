import { expect, test } from '@playwright/test';

import { loadEnvironmentConfig } from '../../../../app/src/config/environment';
import { attachEnvironmentMetadata } from '../../reporting/attachments';
import { WireMockClient } from './wiremock-client';

const runWireMockTests = process.env.RUN_WIREMOCK_TESTS === 'true';

test.describe('WireMock business stubs', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(!runWireMockTests, 'Set RUN_WIREMOCK_TESTS=true after starting Docker services.');

  test.beforeEach(async () => {
    const environment = loadEnvironmentConfig();
    await new WireMockClient(environment.wireMockBaseUrl).resetToDefaults();
  });

  test.afterEach(async () => {
    const environment = loadEnvironmentConfig();
    await new WireMockClient(environment.wireMockBaseUrl).resetToDefaults();
  });

  test('serves the reusable inventory response file and records the request', async ({
    request,
  }, testInfo) => {
    const environment = loadEnvironmentConfig();
    const wireMock = new WireMockClient(environment.wireMockBaseUrl);
    await attachEnvironmentMetadata(testInfo, environment);

    const response = await request.get(
      `${environment.wireMockBaseUrl}/downstream/inventory/SKU-AVAILABLE`,
    );

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({
      sku: 'SKU-AVAILABLE',
      available: true,
      quantity: 12,
    });
    await wireMock.verifyRequest({ method: 'GET', urlPath: '/downstream/inventory/SKU-AVAILABLE' });
  });

  test('creates and verifies a test-specific failure stub', async ({ request }, testInfo) => {
    const environment = loadEnvironmentConfig();
    const wireMock = new WireMockClient(environment.wireMockBaseUrl);
    await attachEnvironmentMetadata(testInfo, environment);
    await wireMock.createStub({
      request: { method: 'GET', urlPath: '/downstream/inventory/SKU-UNAVAILABLE' },
      response: {
        status: 409,
        headers: { 'content-type': 'application/json' },
        jsonBody: { sku: 'SKU-UNAVAILABLE', available: false },
      },
    });

    const response = await request.get(
      `${environment.wireMockBaseUrl}/downstream/inventory/SKU-UNAVAILABLE`,
    );

    expect(response.status()).toBe(409);
    await expect(response.json()).resolves.toEqual({ sku: 'SKU-UNAVAILABLE', available: false });
    await wireMock.verifyRequest({
      method: 'GET',
      urlPath: '/downstream/inventory/SKU-UNAVAILABLE',
    });
  });
});
