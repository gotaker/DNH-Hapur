import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/page-header';
import { doctors } from '@/content/data/doctors';
import { pick } from '@/content/data/types';
import type { Locale } from '@/i18n/routing';

export default async function FacultyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('nav');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  // For phase 4 we treat senior consultants as faculty. Phase 5 introduces
  // a dedicated Faculty collection in Payload that is distinct from clinical
  // doctors but linked to them.
  const faculty = doctors;

  return (
    <>
      <PageHeader
        eyebrow={tNav('academics')}
        title={tNav('faculty')}
        lede={t(
          'Senior clinicians who teach across the medical college and supervise residents and fellows.',
          'वरिष्ठ चिकित्सक जो चिकित्सा महाविद्यालय में पढ़ाते हैं और रेज़िडेंट्स तथा फ़ेलोज़ का पर्यवेक्षण करते हैं।',
        )}
      />

      <section className="bg-surface">
        <div className="container-wide py-section">
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.map((d) => (
              <li key={d.slug} className="flex flex-col">
                {d.image ? (
                  <div className="bg-surface-deep relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={d.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/5] w-full bg-surface-deep" aria-hidden />
                )}
                <h2 className="font-display text-ink mt-4 text-2xl leading-snug">
                  <Link
                    href={`/patients/doctors/${d.slug}`}
                    className="hover:text-brand transition-colors"
                  >
                    {pick(d.name, locale)}
                  </Link>
                </h2>
                <p className="text-ink-mute mt-1 text-sm">{pick(d.specialty, locale)}</p>
                <p className="text-ink-soft mt-1 font-mono text-[10px] uppercase tracking-wider">
                  {d.qualifications}
                </p>
                <p className="text-ink-mute mt-3 text-sm leading-relaxed">{pick(d.bio, locale)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
