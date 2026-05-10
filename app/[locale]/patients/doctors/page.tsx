import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { DoctorsBrowser } from './doctors-browser';
import { localeListPage } from '@/lib/page-shells/locale-list-page';
import { getReader } from '@/lib/content';
import type { DoctorRecord } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

export default async function DoctorsListPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const reader = await getReader();
  const t = await getTranslations('nav');

  return localeListPage<DoctorRecord>({
    locale,
    list: () => reader.listDoctors(locale),
    body: (records) => {
      const rows = records.map((d) => ({
        slug: d.slug,
        name: d.name,
        specialty: d.specialty,
        qualifications: d.qualifications,
        languages: d.languages.join(', '),
        opdDays: d.opdDays ?? '',
        departments: d.departments.map((dep) => dep.slug),
        image: d.image?.url ?? null,
      }));

      const departmentOptions = Array.from(
        new Map(
          records
            .flatMap((d) => d.departments)
            .map((dep) => [dep.slug, { slug: dep.slug, name: dep.name }]),
        ).values(),
      );

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
    },
  });
}
