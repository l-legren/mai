'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  /** 'sm' (default) fits a single-column form; 'lg' fits a form with side-by-side field rows. */
  size?: 'sm' | 'lg';
};

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  lg: 'max-w-xl',
};

const Modal = ({ open, onClose, ariaLabel, children, size = 'sm' }: ModalProps) => {
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
        className={cn(
          'relative w-full rounded-mq-lg border border-border bg-surface-raised p-6 shadow-mq-window',
          SIZE_CLASSES[size]
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
