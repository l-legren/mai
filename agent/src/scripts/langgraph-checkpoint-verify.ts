import 'dotenv/config';
import { randomUUID } from 'crypto';
import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

// LEG-170: proves checkpoints survive across separate process runs via Postgres, not in-memory. Run `langgraph:verify-write`, then `langgraph:verify-read -- <threadId>` in a fresh process.

const VerifyState = Annotation.Root({
  count: Annotation<number>({ reducer: (_prev, next) => next, default: () => 0 }),
});

function buildGraph(checkpointer: PostgresSaver) {
  return new StateGraph(VerifyState)
    .addNode('increment', (state) => ({ count: state.count + 1 }))
    .addEdge(START, 'increment')
    .addEdge('increment', END)
    .compile({ checkpointer });
}

async function main(): Promise<void> {
  // pnpm forwards a literal `--` into argv here instead of stripping it as a separator.
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const mode = args[0];
  if (mode !== 'write' && mode !== 'read') {
    throw new Error('Usage: tsx langgraph-checkpoint-verify.ts <write|read> [threadId]');
  }

  const connectionString = process.env.LANGGRAPH_DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing LANGGRAPH_DATABASE_URL — see .env.example.');
  }

  const checkpointer = PostgresSaver.fromConnString(connectionString);
  const graph = buildGraph(checkpointer);

  if (mode === 'write') {
    const threadId = randomUUID();
    const result = await graph.invoke({}, { configurable: { thread_id: threadId } });
    console.log(`Wrote checkpoint for thread ${threadId} — count is now ${result.count}.`);
    console.log(`Run next, in a fresh process: pnpm langgraph:verify-read -- ${threadId}`);
    return;
  }

  const threadId = args[1];
  if (!threadId) {
    throw new Error('Usage: tsx langgraph-checkpoint-verify.ts read <threadId>');
  }

  const state = await graph.getState({ configurable: { thread_id: threadId } });
  if (!state.values || typeof state.values.count !== 'number') {
    throw new Error(`No checkpoint found for thread ${threadId}.`);
  }
  console.log(`Read back thread ${threadId} — count is ${state.values.count}.`);
  console.log(
    state.values.count === 1
      ? 'Matches what "write" stored — Postgres is actually carrying the state.'
      : 'Unexpected value — something is off.'
  );
}

main().catch((error: unknown) => {
  console.error('langgraph-checkpoint-verify failed:', error);
  process.exit(1);
});
