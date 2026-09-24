import type { QueryResultRow } from 'pg';

export interface QueryExecutor {
  query<TRow extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: TRow[] }>;
}

export async function queryRows<TRow extends QueryResultRow>(
  executor: QueryExecutor,
  text: string,
  values?: readonly unknown[],
): Promise<TRow[]> {
  const result = await executor.query<TRow>(text, values);
  return result.rows;
}

export async function queryOne<TRow extends QueryResultRow>(
  executor: QueryExecutor,
  text: string,
  values?: readonly unknown[],
): Promise<TRow | undefined> {
  const rows = await queryRows<TRow>(executor, text, values);
  return rows[0];
}
