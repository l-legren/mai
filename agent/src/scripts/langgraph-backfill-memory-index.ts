import 'dotenv/config';
import postgres from 'postgres';

import { getUserMemories } from '../tools/index.ts';
import { indexUserMemory } from '../memory/store.ts';

// LEG-173: one-off, run by hand after langgraph:setup — embeds facts saved before the store existed. Idempotent (content-hash keyed), safe to re-run.
async function main(): Promise<void> {
  const connectionString = process.env.LANGGRAPH_DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing LANGGRAPH_DATABASE_URL — see .env.example.');
  }

  const sql = postgres(connectionString, { max: 1 });
  try {
    const rows = await sql<{ thread_id: string }[]>`
      select distinct thread_id from public.checkpoints
    `;

    for (const { thread_id: userId } of rows) {
      try {
        const facts = await getUserMemories(userId);
        for (const fact of facts) {
          await indexUserMemory(userId, fact);
        }
        console.log(`Backfilled ${facts.length} fact(s) for user ${userId}.`);
      } catch (error) {
        console.error(`langgraph-backfill-memory-index: failed for user ${userId}`, error);
      }
    }
  } finally {
    await sql.end();
  }
  console.log('Backfill complete.');
}

main().catch((error: unknown) => {
  console.error('langgraph-backfill-memory-index failed:', error);
  process.exit(1);
});
