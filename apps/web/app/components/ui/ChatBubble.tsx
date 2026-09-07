// design-system/reference/ChatBubble.jsx — user gets a container, agent talks bare with an
// optional status line (design-system/CLAUDE.md's Components table).
import type { ReactNode } from 'react';

export type ChatBubbleProps = {
  from?: 'agent' | 'user';
  children?: ReactNode;
  /** One status line, e.g. "Looked at this week's transactions" — shown once the reply finishes. */
  status?: string;
};

const ChatBubble = ({ from = 'agent', children, status }: ChatBubbleProps) => {
  if (from === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-[18px_18px_6px_18px] bg-bubble px-[17px] py-[13px] text-[15.5px] leading-[1.45] text-text">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-pretty text-[15.5px] leading-[1.55] text-text">{children}</div>
      {status && (
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-text-3" />
          <span className="text-[13px] text-text-3">{status}</span>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
