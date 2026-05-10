import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/json-ld';
import type { Locale } from '@/i18n/routing';

export type LocaleListPageProps<T> = {
  locale: Locale;
  list: () => Promise<T[]>;
  jsonLd?: (records: T[]) => unknown;
  body: (records: T[]) => ReactNode;
};

/**
 * localeListPage — the Locale Page Shell for hub / list routes.
 *
 * Owns: locale priming, list fetch, optional JSON-LD body emission,
 * and body delegation. Does not call notFound() — an empty list is a
 * valid render outcome (the body is responsible for handling that
 * case).
 */
export async function localeListPage<T>({
  locale,
  list,
  jsonLd,
  body,
}: LocaleListPageProps<T>): Promise<ReactNode> {
  setRequestLocale(locale);
  const records = await list();
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd(records)} /> : null}
      {body(records)}
    </>
  );
}
