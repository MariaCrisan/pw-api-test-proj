import { randomUUID } from 'node:crypto';

export function createCorrelationId(prefix = 'test'): string {
  const normalizedPrefix = prefix.trim().replace(/[^A-Za-z0-9_-]/g, '-');
  return `${normalizedPrefix || 'test'}-${randomUUID()}`;
}
