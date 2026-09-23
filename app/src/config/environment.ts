import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

const environmentSchema = z.object({
  APP_ENV: z.enum(['local', 'dev', 'stage']).default('local'),
  API_BASE_URL: z.string().url().default('http://localhost:8080'),
  KAFKA_CLIENT_ID: z.string().min(1).default('pw-api-test-framework'),
  KAFKA_BROKERS: z.string().min(1).default('localhost:9092'),
  KAFKA_SSL: z.enum(['true', 'false']).default('false'),
  POSTGRES_HOST: z.string().min(1).default('localhost'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DATABASE: z.string().min(1).default('api_test'),
  POSTGRES_USER: z.string().min(1).default('api_test'),
  POSTGRES_PASSWORD: z.string().min(1).default('api_test'),
  WIREMOCK_BASE_URL: z.string().url().default('http://localhost:8080'),
  ASSERTION_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  ASSERTION_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(250),
});

export interface EnvironmentConfig {
  environment: 'local' | 'dev' | 'stage';
  apiBaseUrl: string;
  kafka: {
    clientId: string;
    brokers: string[];
    ssl: boolean;
  };
  postgres: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  wireMockBaseUrl: string;
  assertions: {
    timeoutMs: number;
    pollIntervalMs: number;
  };
}

export function loadEnvironmentConfig(
  environment: NodeJS.ProcessEnv = process.env,
): EnvironmentConfig {
  const parsed = environmentSchema.safeParse(environment);

  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }

  const values = parsed.data;

  return {
    environment: values.APP_ENV,
    apiBaseUrl: values.API_BASE_URL,
    kafka: {
      clientId: values.KAFKA_CLIENT_ID,
      brokers: values.KAFKA_BROKERS.split(',').map((broker) => broker.trim()),
      ssl: values.KAFKA_SSL === 'true',
    },
    postgres: {
      host: values.POSTGRES_HOST,
      port: values.POSTGRES_PORT,
      database: values.POSTGRES_DATABASE,
      user: values.POSTGRES_USER,
      password: values.POSTGRES_PASSWORD,
    },
    wireMockBaseUrl: values.WIREMOCK_BASE_URL,
    assertions: {
      timeoutMs: values.ASSERTION_TIMEOUT_MS,
      pollIntervalMs: values.ASSERTION_POLL_INTERVAL_MS,
    },
  };
}

export function loadEnvironmentFile(): void {
  loadDotenv({ quiet: true });
}
