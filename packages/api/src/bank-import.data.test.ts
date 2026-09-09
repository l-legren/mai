import { ApiError, RowLimitExceededError } from './api-error';
import { insertBankImportRows, type NewBankImportRow } from './bank-import.data';
import { createMockSupabaseClient } from './test-helpers';
import { mockQueryBuilder } from './utils/supabase-query-builder';

const client = createMockSupabaseClient();
const mockFrom = client.from as jest.MockedFunction<typeof client.from>;

const row: NewBankImportRow = {
  category: 'other',
  amount: -16.85,
  spent_on: '2026-09-08',
  spent_at: '2026-09-08T00:00:00.000Z',
  note: 'VISA REWE MARTIN NOTHEL: KAUFUMSATZ',
  import_hash: 'hash-1',
};

describe('bank-import.data', () => {
  it('returns 0 without calling Supabase when there are no rows to insert', async () => {
    await expect(insertBankImportRows(client as never, [])).resolves.toBe(0);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('resolves to the count of rows actually inserted, excluding conflicts skipped by ignoreDuplicates', async () => {
    const builder = mockQueryBuilder({ data: [{ id: '1' }], error: null });
    mockFrom.mockReturnValue(builder as never);

    const result = await insertBankImportRows(client as never, [
      row,
      { ...row, import_hash: 'hash-2' },
    ]);

    expect(result).toBe(1);
    expect(builder.upsert).toHaveBeenCalledWith(
      [row, { ...row, import_hash: 'hash-2' }],
      { onConflict: 'user_id,import_hash', ignoreDuplicates: true }
    );
  });

  it('throws an ApiError instead of silently dropping rows when the upsert fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'constraint violation' } }) as never
    );

    await expect(insertBankImportRows(client as never, [row])).rejects.toBeInstanceOf(ApiError);
  });

  it('throws a RowLimitExceededError, not a generic ApiError, when the batch would cross the row cap', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({
        data: null,
        error: { message: 'expense row limit reached', code: 'MQ001' },
      }) as never
    );

    await expect(insertBankImportRows(client as never, [row])).rejects.toBeInstanceOf(
      RowLimitExceededError
    );
  });
});
