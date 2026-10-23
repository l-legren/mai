// Served from apps/web/public — lets a demo user try bank-CSV import without a real export.
export const SAMPLE_CSV_URL = '/sample-bank-statement.csv';

export async function fetchSampleCsvFile(): Promise<File> {
  const response = await fetch(SAMPLE_CSV_URL);
  if (!response.ok) throw new Error(`sample fetch failed: ${response.status}`);
  const blob = await response.blob();
  return new File([blob], 'sample-bank-statement.csv', { type: 'text/csv' });
}
