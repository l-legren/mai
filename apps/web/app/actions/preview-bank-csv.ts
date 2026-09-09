'use server';

import { parseBankCsv } from '@/lib/bank-import';
import { applyRowCap, EXPENSE_ROW_CAP, expenseRowCapWindowStart } from '@/lib/expense-row-cap';
import { getCurrentExpenseRowCount } from '@/lib/dal/expenses';
import type { NewBankImportRow } from '@mai/api';

export type PreviewBankCsvErrorCode = 'invalidFile' | 'empty' | 'capReached' | 'unknown';

export type PreviewBankCsvResult =
  | {
      success: true;
      rows: NewBankImportRow[];
      skippedCount: number;
      overCapCount: number;
      currentCount: number;
    }
  | { success: false; errorCode: PreviewBankCsvErrorCode };

// Parses and pre-trims to the row cap without inserting, so the UI can show real counts and get
// confirmation before writing any expenses (design-system's "every write asks first" rule) — see
// import-bank-csv.ts for the write, which re-checks capacity again rather than trusting this preview.
export async function previewBankCsvAction(formData: FormData): Promise<PreviewBankCsvResult> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, errorCode: 'invalidFile' };
  }

  const buffer = await file.arrayBuffer();
  // German bank exports are commonly Windows-1252/ISO-8859-1, not UTF-8 — decoding as UTF-8 would
  // mangle umlauts in payee names. windows-1252 also decodes plain ASCII/UTF-8-safe files correctly.
  const csvText = new TextDecoder('windows-1252').decode(buffer);
  const { rows: parsedRows, skippedCount } = parseBankCsv(csvText);

  if (parsedRows.length === 0) return { success: false, errorCode: 'empty' };

  // A file with more rows than the cap allows can never fully fit this window no matter how many
  // the account already has (best case is a fresh window, i.e. currentCount 0) — no need to spend a
  // DB round trip finding that out.
  if (parsedRows.length > EXPENSE_ROW_CAP) return { success: false, errorCode: 'capReached' };

  try {
    const currentCount = await getCurrentExpenseRowCount(expenseRowCapWindowStart());
    if (currentCount >= EXPENSE_ROW_CAP) return { success: false, errorCode: 'capReached' };

    const { rows, overCapCount } = applyRowCap(parsedRows, currentCount);
    return { success: true, rows, skippedCount, overCapCount, currentCount };
  } catch (error) {
    console.error('previewBankCsvAction failed:', error);
    return { success: false, errorCode: 'unknown' };
  }
}
