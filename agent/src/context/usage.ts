import { withScopedRead, withScopedWrite } from '../db.ts';

/** Fails open to 0 (Sonnet-eligible) on a read error rather than blocking Ask Mai over a DB hiccup. */
export async function getDailyTokensUsed(userId: string): Promise<number> {
  try {
    return await withScopedRead(userId, async (tx) => {
      const rows = await tx<{ tokens_used: number }[]>`
        select tokens_used from public.mai_daily_usage
        where user_id = ${userId} and usage_date = current_date
      `;
      return rows[0]?.tokens_used ?? 0;
    });
  } catch (error) {
    console.error('usage: getDailyTokensUsed failed', error);
    return 0;
  }
}

/**
 * Total tokens used today across all users. Reads via `mai_global_daily_tokens_used()`, a
 * security definer function (see its migration) — mcp_readonly's own RLS policy on
 * mai_daily_usage is scoped to one user, so a plain select here would silently undercount to just
 * the caller's own usage instead of the true global total. Fails open to 0, same as
 * `getDailyTokensUsed`.
 */
export async function getGlobalDailyTokensUsed(userId: string): Promise<number> {
  try {
    return await withScopedRead(userId, async (tx) => {
      const rows = await tx<{ total: number }[]>`
        select public.mai_global_daily_tokens_used() as total
      `;
      return rows[0]?.total ?? 0;
    });
  } catch (error) {
    console.error('usage: getGlobalDailyTokensUsed failed', error);
    return 0;
  }
}

/** Best-effort: a failure here only affects tomorrow's bookkeeping, not this reply. */
export async function addDailyTokensUsed(userId: string, tokens: number): Promise<void> {
  try {
    await withScopedWrite(userId, async (tx) => {
      await tx`
        insert into public.mai_daily_usage (user_id, tokens_used)
        values (${userId}, ${tokens})
        on conflict (user_id, usage_date)
        do update set tokens_used = mai_daily_usage.tokens_used + excluded.tokens_used
      `;
    });
  } catch (error) {
    console.error('usage: addDailyTokensUsed failed: \n', error);
  }
}
