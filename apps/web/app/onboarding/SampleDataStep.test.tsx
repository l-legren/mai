// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/app/actions/preview-bank-csv', () => ({ previewBankCsvAction: vi.fn() }));
vi.mock('@/app/actions/import-bank-csv', () => ({ importBankCsvAction: vi.fn() }));

import { importBankCsvAction } from '@/app/actions/import-bank-csv';
import { previewBankCsvAction } from '@/app/actions/preview-bank-csv';
import SampleDataStep from './SampleDataStep';

afterEach(cleanup);

const parsedRow = {
  category: 'other',
  amount: -16.85,
  spent_on: '2026-09-08',
  spent_at: '2026-09-08T00:00:00.000Z',
  note: 'VISA REWE MARTIN NOTHEL: KAUFUMSATZ',
  import_hash: 'hash-1',
};

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('SampleDataStep', () => {
  it('advances to the next step without loading anything when skipped', () => {
    const onNext = vi.fn();
    render(<SampleDataStep onBack={vi.fn()} onNext={onNext} />);

    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }));

    expect(onNext).toHaveBeenCalled();
    expect(previewBankCsvAction).not.toHaveBeenCalled();
  });

  it('calls onBack when Back is clicked', () => {
    const onBack = vi.fn();
    render(<SampleDataStep onBack={onBack} onNext={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalled();
  });

  it('fetches the sample CSV and shows a preview when "Load sample data" is clicked', async () => {
    fetchMock.mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob(['csv'])) });
    vi.mocked(previewBankCsvAction).mockResolvedValue({
      success: true,
      rows: [parsedRow],
      skippedCount: 0,
      overCapCount: 0,
      currentCount: 0,
    });
    render(<SampleDataStep onBack={vi.fn()} onNext={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load sample data' }));

    await screen.findByText('Found 1 transaction to import (0 skipped).');
    expect(fetchMock).toHaveBeenCalledWith('/sample-bank-statement.csv');
  });

  it('shows unknown instead of throwing when fetching the sample CSV fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    render(<SampleDataStep onBack={vi.fn()} onNext={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load sample data' }));

    await screen.findByText('Something went wrong. Please try again.');
    expect(previewBankCsvAction).not.toHaveBeenCalled();
  });

  it('imports the previewed rows and advances to the next step on confirm', async () => {
    fetchMock.mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob(['csv'])) });
    vi.mocked(previewBankCsvAction).mockResolvedValue({
      success: true,
      rows: [parsedRow],
      skippedCount: 0,
      overCapCount: 0,
      currentCount: 0,
    });
    vi.mocked(importBankCsvAction).mockResolvedValue({ success: true, imported: 1 });
    const onNext = vi.fn();
    render(<SampleDataStep onBack={vi.fn()} onNext={onNext} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load sample data' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import' }));

    await vi.waitFor(() => expect(onNext).toHaveBeenCalled());
  });

  it('shows the row-limit message and stays on the preview when the import is rejected', async () => {
    fetchMock.mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob(['csv'])) });
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
    const onNext = vi.fn();
    render(<SampleDataStep onBack={vi.fn()} onNext={onNext} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load sample data' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import' }));

    await screen.findByText(
      "This import would exceed this week's transaction limit — none of it was imported."
    );
    expect(onNext).not.toHaveBeenCalled();
  });

  it('returns to the offer state when the preview is cancelled', async () => {
    fetchMock.mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob(['csv'])) });
    vi.mocked(previewBankCsvAction).mockResolvedValue({
      success: true,
      rows: [parsedRow],
      skippedCount: 0,
      overCapCount: 0,
      currentCount: 0,
    });
    render(<SampleDataStep onBack={vi.fn()} onNext={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load sample data' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(screen.getByRole('button', { name: 'Load sample data' })).toBeTruthy();
  });
});
