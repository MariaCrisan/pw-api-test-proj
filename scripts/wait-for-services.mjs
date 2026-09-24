import { Kafka, logLevel } from 'kafkajs';
import 'dotenv/config';
import pg from 'pg';

const timeoutMs = Number.parseInt(process.env.SERVICE_READINESS_TIMEOUT_MS ?? '60000', 10);
const intervalMs = Number.parseInt(process.env.SERVICE_READINESS_POLL_INTERVAL_MS ?? '1000', 10);
const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
const wireMockBaseUrl = process.env.WIREMOCK_BASE_URL ?? 'http://localhost:8080';
const { Client } = pg;

await waitFor('Kafka', async () => {
  const kafka = new Kafka({ brokers, logLevel: logLevel.NOTHING });
  const admin = kafka.admin();
  await admin.connect();

  try {
    await admin.listTopics();
  } finally {
    await admin.disconnect();
  }
});

await waitFor('PostgreSQL', async () => {
  const client = new Client({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number.parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    database: process.env.POSTGRES_DATABASE ?? 'api_test',
    user: process.env.POSTGRES_USER ?? 'api_test',
    password: process.env.POSTGRES_PASSWORD ?? 'api_test',
  });
  await client.connect();

  try {
    await client.query('SELECT 1');
  } finally {
    await client.end();
  }
});

await waitFor('WireMock', async () => {
  const response = await fetch(`${wireMockBaseUrl}/__admin/mappings`);
  if (!response.ok) {
    throw new Error(`WireMock returned HTTP ${response.status}.`);
  }
});

async function waitFor(name, check) {
  const deadline = Date.now() + timeoutMs;
  let lastError = 'No readiness check was attempted.';

  while (Date.now() < deadline) {
    try {
      await check();
      console.log(`${name} is ready.`);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await delay(intervalMs);
    }
  }

  throw new Error(`${name} was not ready within ${timeoutMs}ms: ${lastError}`);
}

function delay(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
