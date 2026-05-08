import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { DoctorsBrowser } from './doctors-browser';
import { doctors } from '@/content/data/doctors';
import { departments } from '@/content/data/departments';
import { pick } from '@/content/data/types';
import type { Locale } from '@/i18n/routing';

export default async function DoctorsListPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');

  // Materialise plain serialisable rows for the client browser.
  const rows = doctors.map((d) => ({
    slug: d.slug,
    name: pick(d.name, locale),
    specialty: pick(d.specialty, locale),
    qualifications: d.qualifications,
    languages: pick(d.languages, locale).join(', '),
    opdDays: pick(d.opdDays, locale),
    departments: d.departments,
    image: d.image ?? null,
  }));

  const departmentOptions = departments.map((d) => ({
    slug: d.slug.en,
    name: pick(d.name, locale),
  }));

  return (
    <>
      <PageHeader
        eyebrow={t('patients')}
        title={t('doctors')}
        lede={
          locale === 'hi'
            ? 'विशेषज्ञता या नाम से खोजें। OPD समय और अपॉइंटमेंट के लिए चिकित्सक के नाम पर क्लिक करें।'
            : 'Search by specialty or name. Click a physician to see OPD timings and book.'
        }
      />
      <section className="bg-surface">
        <div className="container-wide py-section">
          <DoctorsBrowser
            doctors={rows}
            departments={departmentOptions}
            placeholder={locale === 'hi' ? 'चिकित्सक खोजें…' : 'Search doctors…'}
            allLabel={locale === 'hi' ? 'सभी विभाग' : 'All departments'}
            opdLabel={locale === 'hi' ? 'OPD' : 'OPD'}
            languagesLabel={locale === 'hi' ? 'भाषाएँ' : 'Languages'}
            emptyLabel={locale === 'hi' ? 'कोई परिणाम नहीं।' : 'No matches.'}
          />
        </div>
      </section>
    </>
  );
}
