import type { Locale } from '@/i18n/routing';
import type { Localized } from '@/content/data/types';

/** Build a localized slug path. Returns the locale-specific slug for a section. */
export function localizedHref(
  prefix: string,
  slug: Localized<string>,
  locale: Locale,
): string {
  const localeSlug = slug[locale] ?? slug.en;
  return `${prefix}/${localeSlug}`;
}
