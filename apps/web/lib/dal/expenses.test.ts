import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock('@mai/api', () => ({ getExpenseRows: vi.fn() }));

import { getExpenseRows } from '@mai/api';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createMockClient } from '../../vitest.setup';
import { getExpenses } from './expenses';

vi.mocked(createSupabaseServerClient).mockResolvedValue(createMockClient() as never);

function rowsOf(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index),
    category: 'other',
    amount: -1,
    spent_on: '2026-01-01',
    spent_at: '2026-01-01T00:00:00.000Z',
    note: null,
  }));
}

describe('getExpenses', () => {
  it('returns everything in one call when the result fits under a single page', async () => {
    vi.mocked(getExpenseRows).mockResolvedValueOnce({ rows: rowsOf(3), total: 3 });

    const rows = await getExpenses();

    expect(rows).toHaveLength(3);
    expect(getExpenseRows).toHaveBeenCalledTimes(1);
  });

  // Regression: a plain unpaginated query lets Supabase's PostgREST silently cap the response at
  // its configured max_rows, dropping the oldest rows with no error — see supabase/config.toml's
  // [api] max_rows. getExpenses must always page explicitly instead of ever issuing that query.
  it('pages through multiple full responses instead of stopping at the first page', async () => {
    vi.mocked(getExpenseRows)
      .mockResolvedValueOnce({ rows: rowsOf(1000), total: 1425 })
      .mockResolvedValueOnce({ rows: rowsOf(425), total: 1425 });

    const rows = await getExpenses();

    expect(rows).toHaveLength(1425);
    expect(getExpenseRows).toHaveBeenCalledTimes(2);
    expect(getExpenseRows).toHaveBeenNthCalledWith(1, expect.anything(), {
      pagination: { page: 1, pageSize: 1000 },
    });
    expect(getExpenseRows).toHaveBeenNthCalledWith(2, expect.anything(), {
      pagination: { page: 2, pageSize: 1000 },
    });
  });

  it('passes the date range through to every page', async () => {
    vi.mocked(getExpenseRows).mockResolvedValueOnce({ rows: rowsOf(2), total: 2 });

    await getExpenses({ fromIso: '2026-01-01', toIso: '2026-01-31' });

    expect(getExpenseRows).toHaveBeenCalledWith(expect.anything(), {
      pagination: { page: 1, pageSize: 1000 },
      range: { fromIso: '2026-01-01', toIso: '2026-01-31' },
    });
  });
});
