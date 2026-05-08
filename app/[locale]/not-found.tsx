import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations();
  return (
    <section className="container-content py-section text-center">
      <span className="eyebrow text-brand block">404</span>
      <h1 className="font-display mt-4 text-5xl">{t('common.error')}</h1>
      <Link
        href="/"
        className="text-brand mt-8 inline-block text-sm font-medium underline-offset-4 hover:underline"
      >
        ←
      </Link>
    </section>
  );
}
