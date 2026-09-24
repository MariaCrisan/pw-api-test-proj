import type { PoolClient } from 'pg';

export async function withTransaction<T>(
  client: PoolClient,
  callback: () => Promise<T>,
): Promise<T> {
  await client.query('BEGIN');
  try {
    const result = await callback();
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

export async function cleanupByMarker(
  client: Pick<PoolClient, 'query'>,
  table: string,
  markerColumn: string,
  markerValue: string,
): Promise<void> {
  assertIdentifier(table);
  assertIdentifier(markerColumn);
  await client.query(`DELETE FROM "${table}" WHERE "${markerColumn}" = $1`, [markerValue]);
}

function assertIdentifier(value: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe PostgreSQL identifier: "${value}".`);
  }
}
