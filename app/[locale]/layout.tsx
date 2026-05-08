import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, isLocale, type Locale } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { site } from '@/lib/site';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Analytics } from '@/components/analytics';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    metadataBase: new URL(site.url),
    title: { default: t('name'), template: `%s · ${t('shortName')}` },
    description: t('tagline'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        hi: '/hi',
        'x-default': '/hi',
      },
    },
    openGraph: {
      type: 'website',
      siteName: t('name'),
      title: t('name'),
      description: t('tagline'),
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
    },
  };
}

export const viewport: Viewport = {
  themeColor: 'oklch(0.97 0.006 240)',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr" className={fontVariables}>
      <body className="bg-surface text-ink min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-brand focus:px-4 focus:py-2 focus:text-surface"
          >
            {messages.nav && typeof messages.nav === 'object' && 'skipToContent' in messages.nav
              ? (messages.nav as { skipToContent: string }).skipToContent
              : 'Skip to content'}
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
