import { expect, test } from '@playwright/test';

import { cleanupByMarker, withTransaction } from '../../../app/src/db/transactions';

test.describe('database transaction helpers', () => {
  test('rolls back a transaction after a cleanup failure', async () => {
    const statements: string[] = [];
    const client = {
      query: async (statement: string) => {
        statements.push(statement);
      },
    };

    await expect(
      withTransaction(client as never, async () => {
        throw new Error('simulated cleanup failure');
      }),
    ).rejects.toThrow('simulated cleanup failure');

    expect(statements).toEqual(['BEGIN', 'ROLLBACK']);
  });

  test('deletes only records belonging to the supplied test marker', async () => {
    const queries: Array<{ statement: string; values: readonly unknown[] | undefined }> = [];
    const client = {
      query: async (statement: string, values?: readonly unknown[]) => {
        queries.push({ statement, values });
      },
    };

    await cleanupByMarker(client as never, 'orders', 'test_marker', 'pw-test-123');

    expect(queries).toEqual([
      {
        statement: 'DELETE FROM "orders" WHERE "test_marker" = $1',
        values: ['pw-test-123'],
      },
    ]);
  });

  test('rejects unsafe table and column identifiers before issuing a query', async () => {
    let queryCount = 0;
    const client = {
      query: async () => {
        queryCount += 1;
      },
    };

    await expect(
      cleanupByMarker(client as never, 'orders; DROP TABLE orders', 'test_marker', 'x'),
    ).rejects.toThrow('Unsafe PostgreSQL identifier');
    expect(queryCount).toBe(0);
  });
});
