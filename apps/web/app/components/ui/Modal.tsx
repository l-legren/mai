'use client';

import { useEffect, type ReactNode } from 'react';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
};

const Modal = ({ open, onClose, ariaLabel, children }: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="relative w-full max-w-sm rounded-mq-lg border border-border bg-surface-raised p-6 shadow-mq-window"
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
