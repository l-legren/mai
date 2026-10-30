import 'dotenv/config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

// LEG-171: manual-only cleanup, run by hand whenever you want to reset a user's memory — no timer, no automation.
async function main(): Promise<void> {
  const userId = process.argv.slice(2).filter((arg) => arg !== '--')[0];
  if (!userId) {
    throw new Error('Usage: tsx langgraph-clear-memory.ts <userId>');
  }

  const connectionString = process.env.LANGGRAPH_DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing LANGGRAPH_DATABASE_URL — see .env.example.');
  }

  const checkpointer = PostgresSaver.fromConnString(connectionString);
  await checkpointer.deleteThread(userId);
  console.log(`Cleared memory for user ${userId}.`);
}

main().catch((error: unknown) => {
  console.error('langgraph-clear-memory failed:', error);
  process.exit(1);
});
