import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/json-ld';
import type { Locale } from '@/i18n/routing';

export type LocaleStaticPageProps = {
  locale: Locale;
  /**
   * Optional JSON-LD payload. Static — not parameterised on a record,
   * since static pages have nothing to fetch. Compute it at the call
   * site if it depends on the locale. Pass a serializable object; `null`
   * and `undefined` both suppress the script.
   */
  jsonLd?: unknown;
  body: () => ReactNode;
};

/**
 * localeStaticPage — the Locale Page Shell for routes with no Reader
 * fetch (about, contact, emergency, hubs without a list, etc.).
 *
 * Owns: locale priming + optional JSON-LD body emission. The body is
 * a parameterless render function because there's no record to
 * thread.
 */
export async function localeStaticPage({
  locale,
  jsonLd,
  body,
}: LocaleStaticPageProps): Promise<ReactNode> {
  setRequestLocale(locale);
  return (
    <>
      {jsonLd != null ? <JsonLd data={jsonLd} /> : null}
      {body()}
    </>
  );
}
