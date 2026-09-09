// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/app/actions/preview-bank-csv', () => ({ previewBankCsvAction: vi.fn() }));
vi.mock('@/app/actions/import-bank-csv', () => ({ importBankCsvAction: vi.fn() }));

import { previewBankCsvAction } from '@/app/actions/preview-bank-csv';
import { importBankCsvAction } from '@/app/actions/import-bank-csv';
import ImportCsvModal from './ImportCsvModal';

afterEach(cleanup);

const csvFile = new File(['irrelevant, parsing is mocked'], 'export.csv', { type: 'text/csv' });

const parsedRow = {
  category: 'other',
  amount: -16.85,
  spent_on: '2026-09-08',
  spent_at: '2026-09-08T00:00:00.000Z',
  note: 'VISA REWE MARTIN NOTHEL: KAUFUMSATZ',
  import_hash: 'hash-1',
};

function selectFile(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [csvFile] } });
}

describe('ImportCsvModal', () => {
  it('shows a preview with the transaction count once parsing succeeds', async () => {
    vi.mocked(previewBankCsvAction).mockResolvedValue({
      success: true,
      rows: [parsedRow],
      skippedCount: 1,
      overCapCount: 0,
      currentCount: 3,
    });
    const { container } = render(<ImportCsvModal open onClose={vi.fn()} />);

    selectFile(container);

    await screen.findByText('Found 1 transaction to import (1 skipped).');
  });

  it('shows the translated error and stays on the file picker when parsing fails', async () => {
    vi.mocked(previewBankCsvAction).mockResolvedValue({ success: false, errorCode: 'empty' });
    const { container } = render(<ImportCsvModal open onClose={vi.fn()} />);

    selectFile(container);

    await screen.findByText('No transactions could be read from this file.');
    expect(screen.getByRole('button', { name: 'Choose file' })).toBeTruthy();
  });

  it('shows the demo limit reached message instead of a preview when the account is already at the cap', async () => {
    vi.mocked(previewBankCsvAction).mockResolvedValue({ success: false, errorCode: 'capReached' });
    const { container } = render(<ImportCsvModal open onClose={vi.fn()} />);

    selectFile(container);

    await screen.findByText('This demo allows up to 100 saved transactions per week.');
  });

  it('shows how many will import vs. skip due to the cap when the batch overflows it', async () => {
    vi.mocked(previewBankCsvAction).mockResolvedValue({
      success: true,
      rows: [parsedRow],
      skippedCount: 0,
      overCapCount: 4,
      currentCount: 99,
    });
    const { container } = render(<ImportCsvModal open onClose={vi.fn()} />);

    selectFile(container);

    await screen.findByText(
      'You have 99/100 transactions saved this week. Only 1 of the 5 found will be imported (0 unreadable, 4 over the limit).'
    );
  });

  it('imports the previewed rows, then resets, closes and refreshes on confirm', async () => {
    vi.mocked(previewBankCsvAction).mockResolvedValue({
      success: true,
      rows: [parsedRow],
      skippedCount: 0,
      overCapCount: 0,
      currentCount: 0,
    });
    vi.mocked(importBankCsvAction).mockResolvedValue({ success: true, imported: 1 });
    const onClose = vi.fn();
    const { container } = render(<ImportCsvModal open onClose={onClose} />);

    selectFile(container);
    fireEvent.click(await screen.findByRole('button', { name: 'Import' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(refresh).toHaveBeenCalled();
  });

  it('shows the row-limit message and keeps the preview open when the import is rejected', async () => {
    vi.mocked(previewBankCsvAction).mockResolvedValue({
      success: true,
      rows: [parsedRow],
      skippedCount: 0,
      overCapCount: 0,
      currentCount: 0,
    });
    vi.mocked(importBankCsvAction).mockResolvedValue({
      success: false,
      errorCode: 'rowLimitExceeded',
    });
    const onClose = vi.fn();
    const { container } = render(<ImportCsvModal open onClose={onClose} />);

    selectFile(container);
    fireEvent.click(await screen.findByRole('button', { name: 'Import' }));

    await screen.findByText(
      "This import would exceed this week's transaction limit — none of it was imported."
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
