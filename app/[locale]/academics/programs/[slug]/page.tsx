import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { programs } from '@/content/data/programs';
import { pick } from '@/content/data/types';
import { routing, type Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return programs.flatMap((p) =>
    routing.locales.map((locale) => ({ locale, slug: p.slug[locale] })),
  );
}

function findProgram(slug: string) {
  return programs.find((p) => p.slug.en === slug || p.slug.hi === slug);
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = findProgram(slug);
  if (!p) notFound();

  const tNav = await getTranslations('nav');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  return (
    <>
      <section className="rule-bottom bg-surface">
        <div className="container-wide grid gap-12 py-section lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Link
              href="/academics/programs"
              className="text-ink-mute hover:text-brand text-xs font-medium tracking-wide"
            >
              ← {tNav('programs')}
            </Link>
            <h1 className="font-display text-ink mt-4 text-5xl leading-[1.05] tracking-tight">
              {pick(p.title, locale)}
            </h1>
            <p className="text-ink-mute mt-6 max-w-prose text-lg leading-relaxed">
              {pick(p.summary, locale)}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/academics/admissions">
                  {t('Apply', 'आवेदन करें')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">{t('Talk to admissions', 'प्रवेश से बात करें')}</Link>
              </Button>
            </div>
          </div>

          <dl className="bg-surface-mute grid grid-cols-2 gap-px self-start border border-rule">
            <Stat label={t('Duration', 'अवधि')} value={pick(p.duration, locale)} />
            <Stat label={t('Seats', 'सीटें')} value={String(p.intake)} mono />
            <Stat label={t('Accreditation', 'मान्यता')} value={p.accreditation} mono />
            <Stat label={t('Fee', 'शुल्क')} value={pick(p.feeIndicative, locale)} small />
          </dl>
        </div>
      </section>

      <section className="bg-surface-mute">
        <div className="container-wide py-section grid gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow text-brand">{t('Eligibility', 'पात्रता')}</span>
            <ol className="mt-6 space-y-1">
              {pick(p.eligibility, locale).map((e, i) => (
                <li
                  key={e}
                  className="border-rule rule-bottom flex items-baseline gap-4 py-4 text-base"
                >
                  <span className="text-ink-soft font-mono text-xs tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-ink">{e}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <span className="eyebrow text-brand">
              {t('How to apply', 'आवेदन कैसे करें')}
            </span>
            <ol className="mt-6 space-y-4 text-base text-ink leading-relaxed">
              <li>
                <strong>1. </strong>
                {t(
                  'Confirm eligibility against the list on the left.',
                  'बायीं ओर की सूची से अपनी पात्रता की पुष्टि करें।',
                )}
              </li>
              <li>
                <strong>2. </strong>
                {t(
                  'For NMC-regulated programs, register with the State Counselling Authority. We do not collect counselling forms directly.',
                  'NMC-नियमित पाठ्यक्रमों के लिए राज्य काउंसलिंग प्राधिकरण के साथ पंजीकरण करें। हम सीधे काउंसलिंग फ़ॉर्म नहीं लेते।',
                )}
              </li>
              <li>
                <strong>3. </strong>
                {t(
                  'For fellowships, send your CV and a one-page motivation note to the Academics office via the contact page.',
                  'फ़ेलोशिप के लिए, अपनी CV और एक पृष्ठ की प्रेरणा-नोट संपर्क पृष्ठ के माध्यम से शिक्षाविद कार्यालय को भेजें।',
                )}
              </li>
              <li>
                <strong>4. </strong>
                {t(
                  'Selected candidates are invited for interview. Final list is published on the news page.',
                  'चयनित अभ्यर्थियों को साक्षात्कार के लिए आमंत्रित किया जाता है। अंतिम सूची समाचार पृष्ठ पर प्रकाशित की जाती है।',
                )}
              </li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="bg-surface p-6">
      <span className="eyebrow text-ink-mute">{label}</span>
      <p
        className={
          (small ? 'mt-2 text-base ' : 'mt-2 font-display text-2xl ') +
          (mono ? 'font-mono tabular-nums ' : '') +
          'text-ink leading-snug'
        }
      >
        {value}
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const p = findProgram(slug);
  if (!p) return {};
  return {
    title: pick(p.title, locale),
    description: pick(p.summary, locale),
  };
}
