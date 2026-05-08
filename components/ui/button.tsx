import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/cn';

/**
 * Button — restyled. No rounded pills, no shadow, no gradient.
 * Variants are committed: solid (brand), outline (ink), ghost (text-only),
 * accent (warm saffron emphasis, ≤5% surface budget — use sparingly).
 */
type Variant = 'solid' | 'outline' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  solid: 'bg-brand text-surface hover:bg-brand-deep',
  outline:
    'border border-rule-strong text-ink hover:border-brand hover:text-brand bg-transparent',
  ghost: 'text-ink hover:text-brand bg-transparent',
  accent: 'bg-accent text-ink hover:bg-accent-deep',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'solid', size = 'md', asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref as never}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
});
