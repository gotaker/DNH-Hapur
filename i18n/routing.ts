import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Locale routing for DNH Hapur.
 *
 * Hindi is the default for the Indian audience; English is opt-in.
 * Both prefixes are always emitted in URLs (`/hi/...`, `/en/...`) so links,
 * sitemaps, and hreflang tags stay unambiguous.
 */
export const routing = defineRouting({
  locales: ['hi', 'en'] as const,
  defaultLocale: 'hi',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (routing.locales as readonly string[]).includes(value);
}

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
