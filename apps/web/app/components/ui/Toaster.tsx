'use client';

// shadcn/ui sonner (new-york style) — customized: dropped next-themes (dark-only app), uses --mq-* tokens.
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import 'sonner/dist/styles.css';

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--color-surface-raised)',
          '--normal-text': 'var(--color-text)',
          '--normal-border': 'var(--color-border)',
          '--border-radius': 'var(--radius-mq-md)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export default Toaster;
