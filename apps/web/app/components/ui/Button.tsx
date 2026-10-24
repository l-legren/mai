// shadcn/ui button (new-york style) — customized: brand colors/variants swapped for the app's
// palette (now design-system/CLAUDE.md's --mq-* tokens, see app/globals.css); ref-as-prop
// update below is for React 19, not a shadcn upstream change.
import { ButtonHTMLAttributes, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: 'bg-accent text-accent-ink hover:bg-accent-hover',
        outline: 'border border-border-3 text-text hover:bg-fill',
        ghost: 'text-text hover:text-accent',
        // design-system/CLAUDE.md's Button contract calls this "quiet" — a filled but
        // borderless secondary action (e.g. AgentNote's "Talk about it").
        quiet: 'bg-fill text-text-2 hover:bg-hover',
      },
      size: {
        default: 'h-11 px-6 text-sm',
        lg: 'h-[54px] px-7 text-mq-body',
        sm: 'h-9 px-4 text-xs',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
    },
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    ref?: Ref<HTMLButtonElement>;
  };

// React 19: function components accept `ref` as a plain prop, no forwardRef wrapper needed.
const Button = ({ className, variant, size, asChild = false, ref, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
};

export { Button, buttonVariants };
