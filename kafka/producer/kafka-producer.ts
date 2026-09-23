import type { Kafka, Producer } from 'kafkajs';

import type { JsonValue, ProduceJsonMessage, ProducedKafkaMessage } from '../types';

export class KafkaJsonProducer {
  private readonly producer: Producer;
  private connected = false;

  public constructor(kafka: Kafka) {
    this.producer = kafka.producer({ allowAutoTopicCreation: false });
  }

  public async connect(): Promise<void> {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }

  public async send<TValue extends JsonValue>(
    topic: string,
    message: ProduceJsonMessage<TValue>,
  ): Promise<ProducedKafkaMessage[]> {
    this.assertConnected();

    const timestamp = Date.now().toString();
    const metadata = await this.producer.send({
      topic,
      acks: -1,
      messages: [
        {
          key: message.key,
          value: JSON.stringify(message.value),
          headers: message.headers,
          timestamp,
        },
      ],
    });

    return metadata.map((record) => ({
      topic,
      partition: record.partition,
      offset: record.baseOffset,
      timestamp,
    }));
  }

  private assertConnected(): void {
    if (!this.connected) {
      throw new Error('KafkaJsonProducer is not connected. Call connect() before send().');
    }
  }
}
