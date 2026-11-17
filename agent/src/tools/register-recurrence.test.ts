import { ASK_TOOL_APPROVAL, registerRecurrenceSchema } from './register-recurrence.schema.ts';

const validExpense = {
  type: 'expense' as const,
  name: 'Gym',
  amount: 50,
  cadence: 'monthly' as const,
  termKind: 'perpetual' as const,
  category: 'fitness',
};

describe('registerRecurrence guardrails', () => {
  it('requires user approval — the money-write gate cannot silently regress', () => {
    expect(ASK_TOOL_APPROVAL.registerRecurrence).toBe('user-approval');
  });

  it('accepts a well-formed proposal', () => {
    expect(registerRecurrenceSchema.safeParse(validExpense).success).toBe(true);
  });

  it('defaults termKind to perpetual when omitted', () => {
    const parsed = registerRecurrenceSchema.safeParse({
      type: 'expense',
      name: 'Gym',
      amount: 50,
      cadence: 'monthly',
      category: 'fitness',
    });
    expect(parsed.success && parsed.data.termKind).toBe('perpetual');
  });

  it('rejects a non-positive amount', () => {
    expect(registerRecurrenceSchema.safeParse({ ...validExpense, amount: 0 }).success).toBe(false);
    expect(registerRecurrenceSchema.safeParse({ ...validExpense, amount: -5 }).success).toBe(false);
  });

  it('rejects a category that does not belong to the item type', () => {
    expect(
      registerRecurrenceSchema.safeParse({ ...validExpense, category: 'salary' }).success
    ).toBe(false);
    expect(
      registerRecurrenceSchema.safeParse({ ...validExpense, type: 'income', category: 'fitness' })
        .success
    ).toBe(false);
  });

  it('requires endDate for a term item and forbids it for a perpetual one', () => {
    expect(registerRecurrenceSchema.safeParse({ ...validExpense, termKind: 'term' }).success).toBe(
      false
    );
    expect(
      registerRecurrenceSchema.safeParse({ ...validExpense, endDate: '2027-01' }).success
    ).toBe(false);
    expect(
      registerRecurrenceSchema.safeParse({ ...validExpense, termKind: 'term', endDate: '2027-01' })
        .success
    ).toBe(true);
  });
});
