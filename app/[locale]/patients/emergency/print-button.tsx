'use client';

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-accent mt-6 inline-block text-xs font-medium tracking-wide underline-offset-4 hover:underline print:hidden"
      data-print="hide"
    >
      {label} ↗
    </button>
  );
}
