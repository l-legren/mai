import { describe, expect, it } from 'vitest';
import { formatCurrency, toTransaction } from './format-expense';

describe('formatCurrency', () => {
  it('formats a number as EUR', () => {
    expect(formatCurrency(25.6)).toBe('€25.60');
  });
});

describe('toTransaction', () => {
  it('maps an expense row to its display shape', () => {
    const transaction = toTransaction({
      id: '1',
      category: 'groceries',
      amount: 12.5,
      spent_on: '2026-07-09',
      spent_at: '2026-07-09T14:30:00.000Z',
      note: null,
    });

    // `time` is left unasserted — its exact rendering depends on the runner's local timezone.
    expect(transaction).toEqual(
      expect.objectContaining({
        id: '1',
        categoryId: 'groceries',
        note: null,
        amount: '€12.50',
      })
    );
  });

  it('keeps the note when present, for the caller to prefer over the category label', () => {
    const transaction = toTransaction({
      id: '2',
      category: 'other',
      amount: 4,
      spent_on: '2026-07-09',
      spent_at: '2026-07-09T09:00:00.000Z',
      note: 'Parking fine',
    });

    expect(transaction.note).toBe('Parking fine');
  });
});
