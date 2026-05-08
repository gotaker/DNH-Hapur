import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * The middleware handles locale negotiation for normal traffic, but visitors
 * who arrive without a locale prefix (e.g. crawlers, deep links) land here
 * and we redirect to the default locale.
 */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
