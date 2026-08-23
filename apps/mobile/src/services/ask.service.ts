/**
 * Business layer — Ask Moniq conversation. The agent backend is still in construction (see the
 * moniq-agent project), so this currently exposes a single scripted demo conversation illustrating
 * the two message patterns from the design: plain-text replies, and a budget-change confirm card.
 * Turns carry i18next keys (+ interpolation values) rather than resolved strings, since `t()` can
 * only be called from a component/hook — `useAskConversation` resolves these into display text.
 */

export type AskLineSpec = {
  key: string;
  values?: Record<string, string>;
};

export type AskConfirmCardSpec = {
  titleKey: string;
  fromAmount: string;
  toAmount: string;
  effectiveKey: string;
  totalAmount: string;
};

export type AskTurnSpec =
  | { kind: 'user'; key: string }
  | { kind: 'assistant'; lines: AskLineSpec[]; statusKey?: string; suggestionKeys?: string[] }
  | { kind: 'confirm'; lines: AskLineSpec[]; card: AskConfirmCardSpec; reassuranceKey: string };

const DINING_FROM_AMOUNT = '€200';
const DINING_TO_AMOUNT = '€250';
const WEEK_SPEND_AMOUNT = '€310';
const PROJECTED_AMOUNT = '€480';
const OVER_BY_AMOUNT = '€30';
const MONTHLY_TOTAL_AMOUNT = '€2,150';

export function getDemoConversation(): AskTurnSpec[] {
  return [
    { kind: 'user', key: 'ask.demo.userQ1' },
    {
      kind: 'assistant',
      lines: [
        { key: 'ask.demo.reply1a' },
        { key: 'ask.demo.reply1b', values: { amount: WEEK_SPEND_AMOUNT } },
        { key: 'ask.demo.reply1c' },
      ],
      statusKey: 'ask.statusLine',
    },
    { kind: 'user', key: 'ask.demo.userQ2' },
    {
      kind: 'assistant',
      lines: [
        { key: 'ask.demo.reply2a' },
        { key: 'ask.demo.reply2b', values: { projected: PROJECTED_AMOUNT, over: OVER_BY_AMOUNT } },
      ],
      suggestionKeys: ['ask.demo.chipWhatSpent', 'ask.demo.chipRestOfMonth'],
    },
    { kind: 'user', key: 'ask.demo.userQ3' },
    {
      kind: 'confirm',
      lines: [
        { key: 'ask.demo.reply3a' },
        { key: 'ask.demo.reply3b', values: { amount: DINING_TO_AMOUNT } },
      ],
      card: {
        titleKey: 'ask.demo.confirmTitle',
        fromAmount: DINING_FROM_AMOUNT,
        toAmount: DINING_TO_AMOUNT,
        effectiveKey: 'ask.demo.confirmEffective',
        totalAmount: MONTHLY_TOTAL_AMOUNT,
      },
      reassuranceKey: 'ask.demo.confirmReassurance',
    },
  ];
}
