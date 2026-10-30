// design-system/reference/ChatBubble.jsx — user gets a container, agent talks bare with an
// optional status line (design-system/CLAUDE.md's Components table).
import type { ReactNode } from 'react';

export type ChatBubbleProps = {
  from?: 'agent' | 'user';
  children?: ReactNode;
  /** One status line, e.g. "Looked at this week's transactions" — shown once the reply finishes. */
  status?: string;
};

/** A number with a currency symbol immediately before or after it, e.g. "$50" or "50€". */
const CURRENCY_NUMBER_PATTERN = /[$€£¥]\d[\d,.]*|\d[\d,.]*[$€£¥]/g;

function highlightNumbers(text: string): ReactNode[] {
  const segments: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(CURRENCY_NUMBER_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) segments.push(text.slice(cursor, index));
    segments.push(
      <span
        key={index}
        className="rounded-[4px] bg-highlight px-[3px] font-bold italic text-accent"
      >
        {match[0]}
      </span>
    );
    cursor = index + match[0].length;
  }
  if (cursor < text.length) segments.push(text.slice(cursor));
  return segments;
}

const ChatBubble = ({ from = 'agent', children, status }: ChatBubbleProps) => {
  if (from === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-[18px_18px_6px_18px] bg-bubble px-[17px] py-[13px] text-mq-body leading-[1.45] text-text">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-pretty text-mq-body leading-[1.55] text-text">
        {typeof children === 'string' ? highlightNumbers(children) : children}
      </div>
      {status && (
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-text-3" />
          <span className="text-mq-sm text-text-3">{status}</span>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
