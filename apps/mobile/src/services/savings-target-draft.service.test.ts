import { addMonths } from 'date-fns';

import { draftSavingsTarget } from './savings-target-draft.service';
import { todayISO } from '@/utils/date';

describe('draftSavingsTarget', () => {
  it('trims the prompt into the draft name', async () => {
    const draft = await draftSavingsTarget({ prompt: '  New laptop  ', approxAmount: 1200 });
    expect(draft.name).toBe('New laptop');
  });

  it('carries the approximate amount through as the goal amount', async () => {
    const draft = await draftSavingsTarget({ prompt: 'Trip', approxAmount: 800 });
    expect(draft.goalAmount).toBe(800);
  });

  it('defaults the target date to 6 months out', async () => {
    const draft = await draftSavingsTarget({ prompt: 'Trip', approxAmount: 800 });
    expect(draft.targetDate).toBe(todayISO(addMonths(new Date(), 6)));
  });
});
