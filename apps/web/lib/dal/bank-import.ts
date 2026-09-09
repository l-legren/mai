import { insertBankImportRows, type NewBankImportRow } from '@mai/api';
import { createSupabaseServerClient } from '../supabase-server';

export type { NewBankImportRow };

export async function insertBankImport(rows: NewBankImportRow[]): Promise<number> {
  const supabase = await createSupabaseServerClient();
  return insertBankImportRows(supabase, rows);
}
