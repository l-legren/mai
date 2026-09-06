// shadcn/ui button (new-york style) — customized: brand colors/variants swapped for the app's
// palette; ref-as-prop update below is for React 19, not a shadcn upstream change.
import { ButtonHTMLAttributes, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4FA3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171316] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: 'bg-[#FF4FA3] text-[#2A0A19] hover:bg-[#FF6BB1]',
        outline: 'border border-white/15 text-[#F1EFF0] hover:bg-white/5',
        ghost: 'text-[#F1EFF0] hover:text-[#FF4FA3]',
      },
      size: {
        default: 'h-11 px-6 text-sm',
        lg: 'h-[54px] px-7 text-[15.5px]',
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
