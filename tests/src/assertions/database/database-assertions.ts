import { expect } from '@playwright/test';

import { queryOne, type QueryExecutor } from '../../../../app/src/db/queries';

export async function expectRow<T extends Record<string, unknown>>(
  executor: QueryExecutor,
  text: string,
  values: readonly unknown[] = [],
): Promise<T> {
  const row = await queryOne<T>(executor, text, values);
  expect(row, `Expected a database row for query: ${text}`).toBeDefined();
  return row as T;
}
