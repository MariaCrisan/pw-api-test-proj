import { Faker, en } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';

export interface TestDataOptions {
  seed?: number;
  marker?: string;
}

export function createTestDataFaker(seed?: number): Faker {
  return new Faker({ locale: [en], seed });
}

export function createTestMarker(prefix = 'pw-test'): string {
  const normalized = prefix.trim().replace(/[^A-Za-z0-9_-]/g, '-');
  return `${normalized || 'pw-test'}-${randomUUID()}`;
}
