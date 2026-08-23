import { useTranslation } from 'react-i18next';

import { getDemoConversation } from '@/services/ask.service';

export type AskDisplayConfirmCard = {
  title: string;
  fromAmount: string;
  toAmount: string;
  effective: string;
  footnote: string;
  changeA11yLabel: string;
  doItLabel: string;
  doItA11yLabel: string;
  leaveItLabel: string;
  leaveItA11yLabel: string;
};

export type AskDisplayTurn =
  | { kind: 'user'; text: string; a11yLabel: string }
  | { kind: 'assistant'; lines: string[]; statusLine?: string; suggestions?: string[] }
  | { kind: 'confirm'; lines: string[]; card: AskDisplayConfirmCard; reassurance: string };

/** Resolves the hardcoded demo conversation's i18next keys into display-ready turns. */
export function useAskConversation(): AskDisplayTurn[] {
  const { t } = useTranslation();

  return getDemoConversation().map((turn): AskDisplayTurn => {
    if (turn.kind === 'user') {
      const text = t(turn.key);
      return { kind: 'user', text, a11yLabel: t('ask.userMessageA11y', { message: text }) };
    }

    if (turn.kind === 'assistant') {
      return {
        kind: 'assistant',
        lines: turn.lines.map((line) => t(line.key, line.values)),
        statusLine: turn.statusKey ? t(turn.statusKey) : undefined,
        suggestions: turn.suggestionKeys?.map((key) => t(key)),
      };
    }

    const { card } = turn;
    const title = t(card.titleKey);
    const effective = t(card.effectiveKey);

    return {
      kind: 'confirm',
      lines: turn.lines.map((line) => t(line.key, line.values)),
      card: {
        title,
        fromAmount: card.fromAmount,
        toAmount: card.toAmount,
        effective,
        footnote: t('ask.demo.confirmFootnote', { total: card.totalAmount }),
        changeA11yLabel: t('ask.demo.confirmChangeA11y', {
          title,
          from: card.fromAmount,
          to: card.toAmount,
          effective,
        }),
        doItLabel: t('ask.demo.confirmDoIt'),
        doItA11yLabel: t('ask.demo.confirmDoItA11y', { to: card.toAmount }),
        leaveItLabel: t('ask.demo.confirmLeaveIt'),
        leaveItA11yLabel: t('ask.demo.confirmLeaveItA11y', { from: card.fromAmount }),
      },
      reassurance: t(turn.reassuranceKey),
    };
  });
}
