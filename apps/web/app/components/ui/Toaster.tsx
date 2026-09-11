'use client';

// shadcn/ui sonner (new-york style) — customized: dropped the next-themes theme switch (this app
// is dark-only, see app/globals.css), and swapped shadcn's --popover/--radius tokens for this
// app's own --mq-* ones.
import { Toaster as Sonner, type ToasterProps } from 'sonner';

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
