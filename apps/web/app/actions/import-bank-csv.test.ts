import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/dal/bank-import', () => ({ insertBankImport: vi.fn() }));
vi.mock('@/lib/dal/expenses', () => ({ getCurrentExpenseRowCount: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { RowLimitExceededError } from '@mai/api';
import { insertBankImport } from '@/lib/dal/bank-import';
import { getCurrentExpenseRowCount } from '@/lib/dal/expenses';
import { EXPENSE_ROW_CAP } from '@/lib/expense-row-cap';
import { importBankCsvAction } from './import-bank-csv';
import type { NewBankImportRow } from '@mai/api';

const row: NewBankImportRow = {
  category: 'other',
  amount: -16.85,
  spent_on: '2026-09-08',
  spent_at: '2026-09-08T00:00:00.000Z',
  note: 'VISA REWE MARTIN NOTHEL: KAUFUMSATZ',
  import_hash: 'hash-1',
};

describe('importBankCsvAction', () => {
  it('inserts the rows and revalidates on success', async () => {
    vi.mocked(getCurrentExpenseRowCount).mockResolvedValue(0);
    vi.mocked(insertBankImport).mockResolvedValue(1);

    const result = await importBankCsvAction([row]);

    expect(result).toEqual({ success: true, imported: 1 });
    expect(insertBankImport).toHaveBeenCalledWith([row]);
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/transactions');
  });

  it('returns unknown without revalidating when the insert throws', async () => {
    vi.mocked(getCurrentExpenseRowCount).mockResolvedValue(0);
    vi.mocked(insertBankImport).mockRejectedValue(new Error('db down'));

    const result = await importBankCsvAction([row]);

    expect(result).toEqual({ success: false, errorCode: 'unknown' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns rowLimitExceeded when the DB trigger rejects the batch anyway', async () => {
    vi.mocked(getCurrentExpenseRowCount).mockResolvedValue(0);
    vi.mocked(insertBankImport).mockRejectedValue(new RowLimitExceededError());

    const result = await importBankCsvAction([row]);

    expect(result).toEqual({ success: false, errorCode: 'rowLimitExceeded' });
  });

  it('re-checks capacity itself instead of trusting the caller — trims a batch that no longer fits', async () => {
    vi.mocked(getCurrentExpenseRowCount).mockResolvedValue(EXPENSE_ROW_CAP - 1);
    vi.mocked(insertBankImport).mockResolvedValue(1);
    const secondRow = { ...row, import_hash: 'hash-2' };

    const result = await importBankCsvAction([row, secondRow]);

    expect(result).toEqual({ success: true, imported: 1 });
    expect(insertBankImport).toHaveBeenCalledWith([row]);
  });

  it('returns rowLimitExceeded without calling insert when nothing fits anymore', async () => {
    vi.mocked(getCurrentExpenseRowCount).mockResolvedValue(EXPENSE_ROW_CAP);

    const result = await importBankCsvAction([row]);

    expect(result).toEqual({ success: false, errorCode: 'rowLimitExceeded' });
    expect(insertBankImport).not.toHaveBeenCalled();
  });
});
