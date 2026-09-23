import { Kafka, logLevel, type KafkaConfig, type SASLOptions } from 'kafkajs';

export interface KafkaConnectionConfig {
  clientId: string;
  brokers: string[];
  ssl: boolean;
  sasl?: SASLOptions;
}

const supportedSaslMechanisms = new Set(['plain', 'scram-sha-256', 'scram-sha-512']);

export function loadKafkaConnectionConfig(
  environment: NodeJS.ProcessEnv = process.env,
): KafkaConnectionConfig {
  const brokers = (environment.KAFKA_BROKERS ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

  if (brokers.length === 0) {
    throw new Error('KAFKA_BROKERS must contain at least one broker address.');
  }

  const sasl = loadSaslConfig(environment);

  return {
    clientId: environment.KAFKA_CLIENT_ID ?? 'pw-api-test-framework',
    brokers,
    ssl: environment.KAFKA_SSL === 'true',
    ...(sasl ? { sasl } : {}),
  };
}

export function createKafkaClient(config: KafkaConnectionConfig): Kafka {
  const kafkaConfig: KafkaConfig = {
    clientId: config.clientId,
    brokers: config.brokers,
    ssl: config.ssl,
    logLevel: logLevel.NOTHING,
    ...(config.sasl ? { sasl: config.sasl } : {}),
  };

  return new Kafka(kafkaConfig);
}

function loadSaslConfig(environment: NodeJS.ProcessEnv): SASLOptions | undefined {
  const mechanism = environment.KAFKA_SASL_MECHANISM;

  if (!mechanism) {
    return undefined;
  }

  if (!supportedSaslMechanisms.has(mechanism)) {
    throw new Error(
      `KAFKA_SASL_MECHANISM must be one of: ${[...supportedSaslMechanisms].join(', ')}.`,
    );
  }

  const username = environment.KAFKA_SASL_USERNAME;
  const password = environment.KAFKA_SASL_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'KAFKA_SASL_USERNAME and KAFKA_SASL_PASSWORD are required when SASL is enabled.',
    );
  }

  return { mechanism, username, password } as SASLOptions;
}
