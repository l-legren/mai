// design-system/reference/AgentNote.jsx — agent suggestion with its confirm gate.
import { Button } from './Button';

export type AgentNoteProps = {
  message: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  /** Hide the confirm gate for read-only remarks */
  showActions?: boolean;
  showByline?: boolean;
  bylineLabel?: string;
};

const AgentNote = ({
  message,
  primaryLabel,
  secondaryLabel,
  onPrimaryAction,
  onSecondaryAction,
  showActions = true,
  showByline = true,
  bylineLabel,
}: AgentNoteProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-mq-lg border border-accent-border bg-surface-accent px-[22px] py-5 shadow-mq-card">
      {showByline && bylineLabel && (
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="flex text-accent">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.1 3.4a.6.6 0 0 1 1.13 0l1.1 2.94a3 3 0 0 0 1.77 1.77l2.94 1.1a.6.6 0 0 1 0 1.13l-2.94 1.1a3 3 0 0 0-1.77 1.77l-1.1 2.94a.6.6 0 0 1-1.13 0l-1.1-2.94a3 3 0 0 0-1.77-1.77l-2.94-1.1a.6.6 0 0 1 0-1.13l2.94-1.1a3 3 0 0 0 1.77-1.77z" />
            </svg>
          </span>
          <span className="text-[12.5px] font-semibold text-text-2">{bylineLabel}</span>
        </div>
      )}
      <p className="text-pretty text-[14.5px] leading-normal text-text">{message}</p>
      {showActions && (
        <div className="flex gap-2">
          <Button variant="solid" size="sm" onClick={onPrimaryAction}>
            {primaryLabel}
          </Button>
          <Button variant="quiet" size="sm" onClick={onSecondaryAction}>
            {secondaryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AgentNote;
