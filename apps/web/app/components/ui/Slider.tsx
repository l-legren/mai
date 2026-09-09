// shadcn/ui slider (new-york style) — customized: cn from @/lib/utils and @radix-ui/react-slider
// directly (not the CLI-generated standalone `cn` package / `radix-ui` umbrella package), this
// app's --mq-* tokens swapped in for the generated bg-primary/bg-muted/ring, and a
// `rangeClassName` prop so callers can recolor the filled portion (e.g. SavingsSlider switches it
// to over-budget red).
'use client';

import { type ComponentProps, useMemo } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export type SliderProps = ComponentProps<typeof SliderPrimitive.Root> & {
  rangeClassName?: string;
};

const Slider = ({
  className,
  rangeClassName,
  defaultValue,
  value,
  min = 0,
  max = 100,
  'aria-label': ariaLabel,
  'aria-valuetext': ariaValueText,
  ...props
}: SliderProps) => {
  const values = useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  );

  return (
    <SliderPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-[6px] w-full grow overflow-hidden rounded-[3px] bg-track">
        <SliderPrimitive.Range
          className={cn('absolute h-full rounded-[3px] bg-accent', rangeClassName)}
        />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          aria-label={ariaLabel}
          aria-valuetext={ariaValueText}
          className="block h-[22px] w-[22px] shrink-0 rounded-full bg-text shadow-mq-tip focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
};

export { Slider };
