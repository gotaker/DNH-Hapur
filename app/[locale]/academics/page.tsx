import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/page-header';
import type { Locale } from '@/i18n/routing';

export default async function AcademicsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('nav');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  const sections = [
    {
      href: '/academics/programs',
      label: tNav('programs'),
      body: t(
        'MBBS, postgraduate residencies, FOGSI fellowships, and GNM nursing.',
        'एमबीबीएस, स्नातकोत्तर रेज़िडेंसी, FOGSI फ़ेलोशिप और GNM नर्सिंग।',
      ),
    },
    {
      href: '/academics/admissions',
      label: tNav('admissions'),
      body: t(
        'Calendar, eligibility, and the institution\u2019s no-capitation admissions ethic.',
        'कैलेंडर, पात्रता और बिना कैपिटेशन वाली संस्थागत प्रवेश-नीति।',
      ),
    },
    {
      href: '/academics/faculty',
      label: tNav('faculty'),
      body: t(
        'Senior consultants who teach across the medical college and supervise residents.',
        'वरिष्ठ परामर्शदाता जो चिकित्सा महाविद्यालय में पढ़ाते हैं और रेज़िडेंट्स का पर्यवेक्षण करते हैं।',
      ),
    },
    {
      href: '/academics/research',
      label: tNav('research'),
      body: t(
        'Clinical audits, fellow-led projects, and small grants — anchored to ward questions.',
        'नैदानिक ऑडिट, फ़ेलो-नेतृत्व वाली परियोजनाएँ और छोटे अनुदान — वार्ड के प्रश्नों से जुड़े।',
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={tNav('academics')}
        title={t('Medical College', 'चिकित्सा महाविद्यालय')}
        lede={t(
          'A teaching institution running on the same campus as a tertiary-care hospital. Students see real patients on day one.',
          'एक शिक्षण संस्थान जो तृतीयक देखभाल अस्पताल के साथ-साथ चलता है। छात्र पहले दिन से ही वास्तविक मरीज़ देखते हैं।',
        )}
      />

      <section className="bg-surface">
        <div className="container-wide py-section">
          <ol className="grid gap-px bg-rule sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.href} className="bg-surface flex flex-col p-8">
                <span className="text-ink-soft font-mono text-xs tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="font-display text-ink mt-3 text-3xl leading-tight">
                  <Link href={s.href} className="hover:text-brand transition-colors">
                    {s.label}
                  </Link>
                </h2>
                <p className="text-ink-mute mt-3 max-w-md text-sm leading-relaxed">{s.body}</p>
                <Link
                  href={s.href}
                  className="text-brand mt-auto pt-8 text-xs font-medium tracking-wide"
                >
                  {t('Open', 'खोलें')} →
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
