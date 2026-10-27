import 'dotenv/config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';
import postgres from 'postgres';

import { embedTexts, EMBEDDING_DIMS } from '../memory/embeddings.ts';

// LEG-170: one-off setup, run by hand. Least privilege via a dedicated role, not RLS — LangGraph's own generated SQL has no set_config predicate for an RLS policy to key off.
async function main(): Promise<void> {
  const setupConnectionString = process.env.LANGGRAPH_SETUP_DATABASE_URL;
  if (!setupConnectionString) {
    throw new Error(
      "Missing LANGGRAPH_SETUP_DATABASE_URL. Fill it in locally with the hosted project's " +
        'owner/service connection string for this one run, then clear it — see .env.example.'
    );
  }

  const rolePassword = process.env.LANGGRAPH_ROLE_PASSWORD;
  if (!rolePassword) {
    throw new Error(
      'Missing LANGGRAPH_ROLE_PASSWORD. Pick a strong password for this one run — it becomes ' +
        "mcp_langgraph's login password on the hosted project — see .env.example."
    );
  }

  const sql = postgres(setupConnectionString, { max: 1 });
  try {
    console.log('Creating mcp_langgraph role (if it does not already exist)...');
    const [{ exists }] = await sql<{ exists: boolean }[]>`
      select exists(select 1 from pg_catalog.pg_roles where rolname = 'mcp_langgraph') as exists
    `;
    // DDL doesn't accept bind params, so this inlines the password (escaped) instead of using sql`` — safe here, it's just typed into the developer's own local .env, not untrusted input.
    if (!exists) {
      await sql.unsafe(
        `create role mcp_langgraph login password '${rolePassword.replace(/'/g, "''")}'`
      );
    }

    console.log(
      'Running PostgresSaver.setup() (creates checkpoints/checkpoint_blobs/checkpoint_writes/checkpoint_migrations)...'
    );
    const saver = PostgresSaver.fromConnString(setupConnectionString);
    await saver.setup();
    await saver.end();
    console.log('Checkpoint tables are set up.');

    // Requires OPENAI_API_KEY — PostgresStore needs a real embed reference even though setup() never calls it.
    console.log(
      'Running PostgresStore.setup() (creates store/store_vectors/store_migrations, enables pgvector)...'
    );
    const store = PostgresStore.fromConnString(setupConnectionString, {
      index: { dims: EMBEDDING_DIMS, embed: embedTexts, fields: ['content'] },
    });
    await store.setup();
    await store.stop();
    console.log('Store tables are set up.');

    console.log('Granting mcp_langgraph CRUD on the new tables...');
    await sql`grant connect on database postgres to mcp_langgraph`;
    await sql`grant usage on schema public to mcp_langgraph`;
    await sql`grant select, insert, update, delete on public.checkpoints to mcp_langgraph`;
    await sql`grant select, insert, update, delete on public.checkpoint_blobs to mcp_langgraph`;
    await sql`grant select, insert, update, delete on public.checkpoint_writes to mcp_langgraph`;
    await sql`grant select on public.checkpoint_migrations to mcp_langgraph`;
    await sql`grant select, insert, update, delete on public.store to mcp_langgraph`;
    await sql`grant select, insert, update, delete on public.store_vectors to mcp_langgraph`;
    await sql`grant select on public.store_migrations to mcp_langgraph`;
  } finally {
    await sql.end();
  }
  console.log('Done. mcp_langgraph can now read/write via LANGGRAPH_DATABASE_URL.');
}

main().catch((error: unknown) => {
  console.error('langgraph-setup failed:', error);
  process.exit(1);
});
