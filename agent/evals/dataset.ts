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
  {
    data: {
      prompt: "I keep overspending on takeout every week and it's stressing me out.",
      tools: ['rememberFact', 'getRecentSpending'],
      config: { model: 'claude-sonnet-5' },
    },
    target: { expectedTools: ['rememberFact'], category: 'golden' },
    metadata: {
      description: 'concern about a spending routine/category should trigger rememberFact',
    },
  },
  {
    data: {
      prompt: 'I want to save up for a house down payment in the next 3 years.',
      tools: ['rememberFact', 'getSavingsTargets'],
      config: { model: 'claude-sonnet-5' },
    },
    target: { expectedTools: ['rememberFact'], category: 'golden' },
    metadata: { description: 'future financial goal should trigger rememberFact' },
  },
  {
    data: {
      prompt: 'Remember that my favorite color is blue.',
      tools: ['rememberFact'],
      config: { model: 'claude-sonnet-5' },
    },
    target: { forbiddenTools: ['rememberFact'], category: 'negative' },
    metadata: { description: 'explicit remember request with no finance content must not save' },
  },
  {
    data: {
      prompt: "By the way, my dog's name is Max.",
      tools: ['rememberFact'],
      config: { model: 'claude-sonnet-5' },
    },
    target: { forbiddenTools: ['rememberFact'], category: 'negative' },
    metadata: { description: 'a non-finance fact volunteered casually must not be saved' },
  },
];
