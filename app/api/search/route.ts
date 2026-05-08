import { NextResponse } from 'next/server';
import { searchAll } from '@/lib/search';
import { isLocale } from '@/i18n/routing';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const localeParam = url.searchParams.get('locale') ?? 'hi';
  const locale = isLocale(localeParam) ? localeParam : 'hi';
  const hits = searchAll(q, locale);
  return NextResponse.json({ q, locale, hits });
}
