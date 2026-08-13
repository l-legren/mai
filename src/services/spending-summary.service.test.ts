import { requestSpendingSummary } from '@moniq/api';

import { generateSpendingSummary } from './spending-summary.service';

jest.mock('@moniq/api', () => ({
  ...jest.requireActual('@moniq/api'),
  requestSpendingSummary: jest.fn(),
}));

const mockRequest = requestSpendingSummary as jest.MockedFunction<typeof requestSpendingSummary>;

describe('generateSpendingSummary', () => {
  it('forwards the input to the data layer and returns its response verbatim', async () => {
    mockRequest.mockResolvedValue({ text: 'You spent €120 this week, mostly on groceries.' });

    const input = {
      periodLabel: 'This week',
      spent: 120,
      saved: 40,
      goal: 100,
      onTrack: true,
      breakdown: [{ category: 'groceries' as const, amount: 80 }],
    };

    await expect(generateSpendingSummary(input)).resolves.toEqual({
      text: 'You spent €120 this week, mostly on groceries.',
    });
    expect(mockRequest).toHaveBeenCalledWith(input);
  });
});
