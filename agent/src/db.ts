import postgres from 'postgres';

/** Direct Postgres connections as mcp_readonly/mcp_write (supabase/roles.sql); lazy per env var. */
let readSql: postgres.Sql | undefined;
let writeSql: postgres.Sql | undefined;

function getReadSql(): postgres.Sql {
  if (!readSql) {
    const connectionString = process.env.MCP_READONLY_DATABASE_URL;
    if (!connectionString) {
      throw new Error('MCP_READONLY_DATABASE_URL is not set');
    }
    // max: 1 — an Edge Function isolate handles one request at a time; no pool needed.
    readSql = postgres(connectionString, { max: 1 });
  }
  return readSql;
}

function getWriteSql(): postgres.Sql {
  if (!writeSql) {
    const connectionString = process.env.MCP_WRITE_DATABASE_URL;
    if (!connectionString) {
      throw new Error('MCP_WRITE_DATABASE_URL is not set');
    }
    writeSql = postgres(connectionString, { max: 1 });
  }
  return writeSql;
}

/**
 * Runs `fn` with a transaction-scoped `app.mcp_user_id` set to `userId`, per the RLS policies in
 * supabase/migrations/20260722110000_mcp_readonly_access.sql. Uses `set_config(..., true)` (the
 * `true` = local-to-transaction) rather than string-interpolated `SET LOCAL ... = '<uuid>'`, so the
 * value is passed as a bound parameter instead of into raw SQL text.
 *
 * An empty/missing `userId` fails closed to zero rows (per those policies' design), not to an
 * error — this only guards against a `userId` outside the expected uuid shape reaching the DB.
 */
export async function withScopedRead<T>(
  userId: string,
  fn: (tx: postgres.TransactionSql) => Promise<T>
): Promise<T> {
  if (!userId) {
    throw new Error('withScopedRead requires a non-empty userId');
  }

  const client = getReadSql();
  const result = await client.begin(async (tx) => {
    await tx`select set_config('app.mcp_user_id', ${userId}, true)`;
    return fn(tx);
  });
  return result as T;
}

/** Same as withScopedRead but via mcp_write; fn must set user_id itself (no auth.uid() here). */
export async function withScopedWrite<T>(
  userId: string,
  fn: (tx: postgres.TransactionSql) => Promise<T>
): Promise<T> {
  if (!userId) {
    throw new Error('withScopedWrite requires a non-empty userId');
  }

  const client = getWriteSql();
  const result = await client.begin(async (tx) => {
    await tx`select set_config('app.mcp_user_id', ${userId}, true)`;
    return fn(tx);
  });
  return result as T;
}
