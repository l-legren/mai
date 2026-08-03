import { ApiError } from './api-error';
import { supabase } from './supabase';
import { requestSpendingSummary } from './spending-summary.data';

const mockInvoke = supabase.functions.invoke as jest.MockedFunction<
  typeof supabase.functions.invoke
>;

describe('spending-summary.data', () => {
  const input = {
    periodLabel: 'This week',
    spent: 120,
    saved: 40,
    goal: 100,
    onTrack: true,
    breakdown: [],
  };

  it('returns the summary text on success', async () => {
    mockInvoke.mockResolvedValue({ data: { text: 'Summary text' }, error: null } as never);

    await expect(requestSpendingSummary(input)).resolves.toEqual({ text: 'Summary text' });
    expect(mockInvoke).toHaveBeenCalledWith('generate-spending-summary', { body: input });
  });

  it('throws an ApiError instead of silently returning undefined when the function call fails', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'edge function error' },
    } as never);

    await expect(requestSpendingSummary(input)).rejects.toBeInstanceOf(ApiError);
  });
});
