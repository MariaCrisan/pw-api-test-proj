import type { APIResponse, TestInfo } from '@playwright/test';

import type { EnvironmentConfig } from '../../../app/src/config/environment';
import type { ConsumedKafkaMessage, JsonValue } from '../../../app/src/kafka/types';

export async function attachJson(testInfo: TestInfo, name: string, value: unknown): Promise<void> {
  await testInfo.attach(name, {
    body: JSON.stringify(value, null, 2),
    contentType: 'application/json',
  });
}

export async function attachText(testInfo: TestInfo, name: string, value: string): Promise<void> {
  await testInfo.attach(name, { body: value, contentType: 'text/plain' });
}

export async function attachApiExchange(
  testInfo: TestInfo,
  request: { method: string; url: string; headers?: Record<string, string>; body?: unknown },
  response: APIResponse,
): Promise<void> {
  await attachJson(testInfo, 'API request', request);
  await attachJson(testInfo, 'API response', {
    status: response.status(),
    statusText: response.statusText(),
    url: response.url(),
    headers: response.headers(),
    body: await response.text(),
  });
}

export function attachKafkaMessage<TValue extends JsonValue>(
  testInfo: TestInfo,
  message: ConsumedKafkaMessage<TValue>,
): Promise<void> {
  return attachJson(testInfo, 'Kafka message', message);
}

export function attachDatabaseResult(
  testInfo: TestInfo,
  query: string,
  rows: unknown,
): Promise<void> {
  return attachJson(testInfo, 'PostgreSQL query result', { query, rows });
}

export function attachSchemaResult(
  testInfo: TestInfo,
  schemaName: string,
  value: unknown,
): Promise<void> {
  return attachJson(testInfo, 'Schema validation input', { schemaName, value });
}

export function attachEnvironmentMetadata(
  testInfo: TestInfo,
  environment: EnvironmentConfig,
  correlationId?: string,
): Promise<void> {
  return attachJson(testInfo, 'Execution metadata', {
    environment: environment.environment,
    apiBaseUrl: environment.apiBaseUrl,
    kafkaBrokers: environment.kafka.brokers,
    postgres: {
      host: environment.postgres.host,
      port: environment.postgres.port,
      database: environment.postgres.database,
    },
    wireMockBaseUrl: environment.wireMockBaseUrl,
    assertions: environment.assertions,
    ...(correlationId ? { correlationId } : {}),
  });
}
