// shadcn/ui input (new-york style) — customized: brand colors, plus the label/labelRight header
// and auto-generated id below (shadcn's stock Input has no built-in label).
import { InputHTMLAttributes, ReactNode, Ref, useId } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelRight?: ReactNode;
  ref?: Ref<HTMLInputElement>;
};

// React 19: function components accept `ref` as a plain prop, no forwardRef wrapper needed.
const Input = ({ label, labelRight, id, className, ref, ...props }: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-[#A9A3A8]">
          {label}
        </label>
        {labelRight}
      </div>
      <input
        id={inputId}
        ref={ref}
        className={cn(
          'h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-[15px] text-[#F1EFF0] outline-none transition-colors placeholder:text-[#6E686E] focus-visible:border-[#FF4FA3]',
          className
        )}
        {...props}
      />
    </div>
  );
};

export { Input };
