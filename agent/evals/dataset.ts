import type { SingleTurnDatasetEntry } from './types.ts';

/**
 * Minimal single-turn dataset: two cases that should each pick a different tool. Having both in
 * the same run tests discrimination, not just "can it call a tool when there's only one option."
 */
export const SINGLE_TURN_DATASET: SingleTurnDatasetEntry[] = [
  {
    data: {
      prompt: 'How much did I spend on groceries in March 2026?',
      tools: ['getSpendingByCategory', 'getSavingsTargets'],
    },
    target: {
      expectedTools: ['getSpendingByCategory'],
      forbiddenTools: ['getSavingsTargets'],
      category: 'golden',
    },
    metadata: { description: 'category spend question should pick getSpendingByCategory' },
  },
  {
    data: {
      prompt: 'Am I on track for my Japan trip savings goal?',
      tools: ['getSpendingByCategory', 'getSavingsTargets'],
    },
    target: {
      expectedTools: ['getSavingsTargets'],
      forbiddenTools: ['getSpendingByCategory'],
      category: 'golden',
    },
    metadata: { description: 'savings goal question should pick getSavingsTargets' },
  },
];
