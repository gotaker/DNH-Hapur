import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/json-ld';
import type { Locale } from '@/i18n/routing';

/**
 * Props for localeDetailPage. Generic in the resource type T.
 */
export type LocaleDetailPageProps<T> = {
  /** The route's resolved locale. */
  locale: Locale;
  /** Reader-shaped data fetch. Return null to trigger notFound(). */
  fetch: () => Promise<T | null>;
  /** Optional builder for the page-specific JSON-LD payload. */
  jsonLd?: (record: T) => unknown;
  /** Render the page body given the resolved record. */
  body: (record: T) => ReactNode;
};

/**
 * localeDetailPage — the Locale Page Shell for `[slug]` routes.
 *
 * Owns: locale priming, fetch + notFound, JSON-LD emission, and
 * delegation of the body to the page-supplied render function. The
 * Shell knows nothing about specific resource types — `fetch` is the
 * single one-line interface to the data layer (typically a call to
 * `(await getReader()).getDoctor(...)` or similar at the page-call
 * site, though any function returning `Promise<T | null>` works).
 *
 * Locale-side metadata (canonical, hreflang, JSON-LD in `<head>`) is
 * still emitted by the page's own `generateMetadata` export — the
 * Shell only emits the `application/ld+json` body script.
 */
export async function localeDetailPage<T>({
  locale,
  fetch,
  jsonLd,
  body,
}: LocaleDetailPageProps<T>): Promise<ReactNode> {
  setRequestLocale(locale);
  const record = await fetch();
  if (!record) notFound();
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd(record)} /> : null}
      {body(record)}
    </>
  );
}
