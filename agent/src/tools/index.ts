import { tool, type ToolSet } from 'ai';
import { z } from 'zod';
import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

import { withScopedRead } from '../db.ts';

/** Hard ceiling on how far back `getRecentSpending` can look — enforced before any DB call. */
export const MAX_RECENT_SPENDING_DAYS = 30;

/** Caps memory size since all memories get joined into every system prompt; also enforced in the DB. */
export const MAX_MEMORY_CONTENT_LENGTH = 140;

type CategoryTotal = { category: string; amount: number };

type RecentSpendingResult = {
  days: number;
  hasData: boolean;
  totalSpent: number;
  breakdown: CategoryTotal[];
};

/**
 * Real mai tools the agent can call, scoped to a single user for the lifetime of one request.
 * A factory (rather than a static `ToolSet`) because `getRecentSpending`'s `execute` needs to
 * close over `userId` (to pass to `withScopedRead`) and `today` — the other tools don't have
 * an `execute` body (LEG-108, or `rememberFact` needing confirmation — see `saveUserMemory`).
 *
 * `today` is the caller's own local calendar date (YYYY-MM-DD), not computed here or in SQL via
 * `current_date`: the database session's timezone (UTC) and the user's device timezone can
 * disagree on what day it currently is, and `expenses.spent_on` is always written against the
 * device's local date — so the window has to be anchored to that same local date to line up.
 */
export function createMaiTools(userId: string, today: string): ToolSet {
  return {
    getSavingsTargets: tool({
      description:
        "Get the user's active savings targets with progress (saved vs goal amount, target date). " +
        'Use for questions about savings goals or whether spending threatens a stated goal.',
      inputSchema: z.object({}),
      // TODO(LEG-108): wire to `public.savings_targets` via `withScopedRead`, same pattern below.
    }),

    getRecentSpending: tool({
      description:
        "Get the user's total spending and per-category breakdown for the last N days, inclusive " +
        'of today. Use for questions about recent or relative spending (e.g. "this week", "the ' +
        `last 10 days"). Optionally filter to one category (e.g. "how much on groceries this ` +
        `week"). Do not use for savings goals or a specific calendar date range. N must be ` +
        `between 1 and ${MAX_RECENT_SPENDING_DAYS}.`,
      inputSchema: z.object({
        days: z
          .number()
          .int()
          .min(1)
          .max(MAX_RECENT_SPENDING_DAYS)
          .describe(
            `Number of days to look back, inclusive of today. Max ${MAX_RECENT_SPENDING_DAYS}.`
          ),
        category: z
          .string()
          .optional()
          .describe(
            'Optional category id to filter to a single category; omit for all categories.'
          ),
      }),
      execute: async ({ days, category }): Promise<RecentSpendingResult> => {
        return withScopedRead(userId, async (tx) => {
          const rows = await tx<{ category: string; total: string }[]>`
            select category, sum(amount)::numeric as total
            from public.expenses
            where spent_on >= (${today}::date - ${days - 1}::integer)
              and spent_on <= ${today}::date
              ${category ? tx`and category = ${category}` : tx``}
            group by category
            order by total desc
          `;

          const breakdown: CategoryTotal[] = rows.map((row) => ({
            category: row.category,
            amount: Number(row.total),
          }));
          const totalSpent = breakdown.reduce((sum, entry) => sum + entry.amount, 0);

          return { days, hasData: breakdown.length > 0, totalSpent, breakdown };
        });
      },
    }),

    rememberFact: tool({
      description:
        'Remember a finance-related fact. Only use this when the user expresses concern about ' +
        'a spending routine or category, a future plan or financial goal, or explicitly asks ' +
        'you to remember something about their finances (e.g. "saving for a house down ' +
        'payment", "worried about takeout spending", "count coffee as dining out"). Never use ' +
        'for anything unrelated to their finances, or for a one-off detail only relevant to ' +
        `the current message. Write it as concisely as possible — max ` +
        `${MAX_MEMORY_CONTENT_LENGTH} characters, one fact per call. Saves immediately — tell ` +
        'the user you will remember it.',
      inputSchema: z.object({
        content: z
          .string()
          .min(1)
          .max(MAX_MEMORY_CONTENT_LENGTH)
          .describe(
            `The fact to remember, written as concise plain prose. Max ${MAX_MEMORY_CONTENT_LENGTH} characters.`
          ),
      }),
      execute: async ({ content }) => {
        await saveUserMemory(userId, content);
        return { saved: true };
      },
    }),
  };
}

// LEG-171: memory lives in LangGraph's Postgres checkpointer (LEG-170), one thread per user — not the old mai_memories table. Clear a user's memory with `pnpm langgraph:clear-memory -- <userId>`.
const MemoryState = Annotation.Root({
  facts: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
});

let memoryCheckpointer: PostgresSaver | undefined;
function getMemoryCheckpointer(): PostgresSaver {
  if (!memoryCheckpointer) {
    const connectionString = process.env.LANGGRAPH_DATABASE_URL;
    if (!connectionString) {
      throw new Error('Missing LANGGRAPH_DATABASE_URL');
    }
    memoryCheckpointer = PostgresSaver.fromConnString(connectionString);
  }
  return memoryCheckpointer;
}

function buildMemoryGraph() {
  return (
    new StateGraph(MemoryState)
      // An empty return — not `(state) => state` — so this writes nothing; the `facts` reducer
      // already appended the new content when the input merged in at START, before this node ran.
      .addNode('record', () => ({}))
      .addEdge(START, 'record')
      .addEdge('record', END)
      .compile({ checkpointer: getMemoryCheckpointer() })
  );
}

const MEMORY_DB_TIMEOUT_MS = 10_000;

/** A hung Postgres connection has no built-in timeout here — without this, a stalled write/read never settles, so the caller (an AI SDK tool execute) never resolves either. */
function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${MEMORY_DB_TIMEOUT_MS}ms`)),
        MEMORY_DB_TIMEOUT_MS
      )
    ),
  ]);
}

/** Called from rememberFact's execute — saves immediately, no confirm step. */
export async function saveUserMemory(userId: string, content: string): Promise<void> {
  try {
    const graph = buildMemoryGraph();
    await withTimeout(
      graph.invoke({ facts: [content] }, { configurable: { thread_id: userId } }),
      'saveUserMemory'
    );
  } catch (error) {
    console.error('rememberFact: saveUserMemory failed', error);
    throw error;
  }
}

/** Not a tool — called directly in runAskMai so memories are already in the prompt every turn. */
export async function getUserMemories(userId: string): Promise<string[]> {
  try {
    const graph = buildMemoryGraph();
    const state = await withTimeout(
      graph.getState({ configurable: { thread_id: userId } }),
      'getUserMemories'
    );
    return state.values?.facts ?? [];
  } catch (error) {
    console.error('runAskMai: getUserMemories failed', error);
    throw error;
  }
}
