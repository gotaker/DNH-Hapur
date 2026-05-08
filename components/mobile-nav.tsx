'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetClose,
} from './ui/sheet';
import { Button } from './ui/button';
import { Wordmark } from './wordmark';

type NavItem = { href: string; label: string };

export function MobileNav({
  primary,
  appointmentLabel,
}: {
  primary: NavItem[];
  appointmentLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="text-ink hover:text-brand inline-flex items-center justify-center p-2 lg:hidden"
          aria-label="Open menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            aria-hidden
          >
            <path d="M2 5h18M2 11h18M2 17h18" />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0">
        <div className="flex items-center justify-between border-b border-rule px-6 py-5">
          <SheetTitle asChild>
            <span>
              <Wordmark size="sm" tone="ink" />
            </span>
          </SheetTitle>
          <SheetClose
            aria-label="Close menu"
            className="text-ink-mute hover:text-ink p-2 text-2xl leading-none"
          >
            ×
          </SheetClose>
        </div>
        <nav aria-label="Mobile primary" className="flex flex-col px-6 py-6">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-rule text-ink hover:text-brand border-b py-4 text-lg font-medium tracking-tight transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-6 pb-8">
          <Button asChild size="lg" className="w-full">
            <Link href="/contact" onClick={() => setOpen(false)}>
              {appointmentLabel}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
