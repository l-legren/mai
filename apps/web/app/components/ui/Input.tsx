// shadcn/ui input (new-york style) — customized: brand colors, plus the label/labelRight header
// and auto-generated id below (shadcn's stock Input has no built-in label).
import { InputHTMLAttributes, ReactNode, Ref, useId } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelRight?: ReactNode;
  error?: string | null;
  ref?: Ref<HTMLInputElement>;
};

// React 19: function components accept `ref` as a plain prop, no forwardRef wrapper needed.
const Input = ({ label, labelRight, error, id, className, ref, ...props }: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-text-2">
          {label}
        </label>
        {labelRight}
      </div>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'h-12 rounded-mq-xl border border-border bg-field px-4 text-[15px] text-text outline-none transition-colors placeholder:text-text-4 focus-visible:border-accent',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" aria-live="assertive" className="text-sm text-text-2">
          {error}
        </p>
      )}
    </div>
  );
};

export { Input };
