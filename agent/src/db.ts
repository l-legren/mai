import postgres from 'postgres';

/**
 * Direct Postgres connection as the `mcp_readonly` role (see supabase/roles.sql +
 * supabase/migrations/20260722110000_mcp_readonly_access.sql) — a different auth path from the
 * rest of the app, which goes through PostgREST as `authenticated` via the Supabase JS client.
 * This is what lets a tool's `execute` body read a user's data without an `authenticated` session:
 * the caller instead names the user explicitly via a per-transaction `app.mcp_user_id` GUC.
 *
 * Lazily constructed so importing this module (e.g. transitively via tools.ts, from the
 * single-turn eval executor) never requires MCP_READONLY_DATABASE_URL to be set — only actually
 * calling `withScopedRead` does.
 */
let sql: postgres.Sql | undefined;

function getSql(): postgres.Sql {
  if (!sql) {
    const connectionString = process.env.MCP_READONLY_DATABASE_URL;
    if (!connectionString) {
      throw new Error('MCP_READONLY_DATABASE_URL is not set');
    }
    // max: 1 — an Edge Function isolate handles one request at a time; no pool needed.
    sql = postgres(connectionString, { max: 1 });
  }
  return sql;
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

  const client = getSql();
  const result = await client.begin(async (tx) => {
    await tx`select set_config('app.mcp_user_id', ${userId}, true)`;
    return fn(tx);
  });
  return result as T;
}
