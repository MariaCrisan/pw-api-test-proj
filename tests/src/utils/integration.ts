import { Kafka, logLevel } from 'kafkajs';

export const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';

export async function ensureKafkaTopic(kafka: Kafka, topic: string): Promise<void> {
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: [{ topic, numPartitions: 1, replicationFactor: 1 }],
    });
  } finally {
    await admin.disconnect();
  }
}

export function createIntegrationKafka(brokers: string[]): Kafka {
  return new Kafka({ brokers, logLevel: logLevel.NOTHING });
}
