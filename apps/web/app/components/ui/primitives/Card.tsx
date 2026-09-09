// design-system/reference/Card.jsx — panel surface, reimplemented with this app's tokens/conventions.
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type CardProps = {
  title?: string;
  /** Quiet right-aligned action in the header */
  action?: string;
  onAction?: () => void;
  /** Agent surface: tinted background and accent border */
  accent?: boolean;
  /** Drop body padding — for full-bleed row lists */
  flush?: boolean;
  children?: ReactNode;
};

const Card = ({ title, action, onAction, accent = false, flush = false, children }: CardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-mq-lg border',
        accent ? 'border-accent-border bg-surface-accent' : 'border-border bg-surface-raised'
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 pt-[18px] pb-3.5">
          {title && <span className="text-[15px] font-semibold text-text">{title}</span>}
          {/* text-3 (design-system's reference color here) computes to ~3.9:1 against
              surface-raised — below WCAG AA. text-2 is ~7:1; text is used on hover for emphasis. */}
          {action && (
            <button
              type="button"
              onClick={onAction}
              className="text-[13px] font-medium text-text-2 hover:text-text"
            >
              {action}
            </button>
          )}
        </div>
      )}
      <div className={cn(flush ? 'flex flex-1 flex-col' : title ? 'px-6 pb-5' : 'p-[22px]')}>
        {children}
      </div>
    </div>
  );
};

export default Card;
