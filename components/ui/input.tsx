import * as React from 'react';
import { cn } from '@/lib/cn';

/** Input — single-line. Hairline rule under the field, no rounded chrome. */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'block w-full bg-transparent border-0 border-b border-rule px-0 py-2.5',
        'text-ink placeholder:text-ink-soft text-base',
        'focus:border-brand focus:outline-none focus:ring-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'block w-full resize-y bg-transparent border border-rule px-3 py-2',
        'text-ink placeholder:text-ink-soft text-base leading-relaxed',
        'focus:border-brand focus:outline-none focus:ring-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
});
