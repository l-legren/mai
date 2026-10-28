import { createHash } from 'crypto';
import { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';

import { embedTexts, EMBEDDING_DIMS } from './embeddings.ts';
import { withTimeout } from '../utils/withTimeout.ts';

function memoryNamespace(userId: string): string[] {
  return ['memories', userId];
}

function keyForContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

const STORE_DB_TIMEOUT_MS = 10_000;

let memoryStore: PostgresStore | undefined;
function getMemoryStore(): PostgresStore {
  if (!memoryStore) {
    const connectionString = process.env.LANGGRAPH_DATABASE_URL;
    if (!connectionString) {
      throw new Error('Missing LANGGRAPH_DATABASE_URL');
    }
    // ensureTables: false — mcp_langgraph has no DDL grant; tables are created once by langgraph-setup.ts.
    memoryStore = PostgresStore.fromConnString(connectionString, {
      ensureTables: false,
      index: { dims: EMBEDDING_DIMS, embed: embedTexts, fields: ['content'] },
    });
  }
  return memoryStore;
}

/** Derived index alongside the checkpointer (source of truth) — fails soft, never throws. */
export async function indexUserMemory(userId: string, content: string): Promise<void> {
  try {
    await withTimeout(
      getMemoryStore().put(memoryNamespace(userId), keyForContent(content), {
        content,
        createdAt: new Date().toISOString(),
      }),
      'indexUserMemory',
      STORE_DB_TIMEOUT_MS
    );
  } catch (error) {
    console.error('rememberFact: indexUserMemory failed', error);
  }
}

/** Fails open to [] — semantic search is additive, never blocks the caller. */
export async function searchUserMemories(
  userId: string,
  query: string,
  limit = 5
): Promise<string[]> {
  try {
    const results = await withTimeout(
      getMemoryStore().search(memoryNamespace(userId), { query, limit, mode: 'vector' }),
      'searchUserMemories',
      STORE_DB_TIMEOUT_MS
    );
    return results.map((item) => String(item.value.content));
  } catch (error) {
    console.error('runAskMai: searchUserMemories failed', error);
    return [];
  }
}
