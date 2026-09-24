import { Pool, type PoolClient, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';

export type DbQueryResult<TRow extends QueryResultRow = QueryResultRow> = QueryResult<TRow>;

export class PostgresClient {
  private readonly pool: Pool;

  public constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  public query<TRow extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<DbQueryResult<TRow>> {
    return this.pool.query<TRow>(text, values as unknown[] | undefined);
  }

  public async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
