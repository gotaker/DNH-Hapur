import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/page-header';
import type { Locale } from '@/i18n/routing';

export default async function ResearchPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('nav');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  return (
    <>
      <PageHeader
        eyebrow={tNav('academics')}
        title={tNav('research')}
        lede={t(
          'A working research arm — clinical audits, fellow-led projects, and small grants — anchored to the questions our wards actually raise.',
          'एक कार्यशील अनुसंधान प्रभाग — नैदानिक ऑडिट, फ़ेलो-नेतृत्व वाली परियोजनाएँ और छोटे अनुदान — हमारे वार्डों में उठने वाले वास्तविक प्रश्नों से जुड़े।',
        )}
      />

      <section className="rule-bottom bg-surface">
        <div className="container-wide py-section grid gap-12 lg:grid-cols-3">
          <div>
            <span className="eyebrow text-brand">
              {t('Areas of focus', 'फोकस के क्षेत्र')}
            </span>
            <ul className="text-ink mt-6 space-y-1 text-base">
              {[
                t('Reproductive medicine and IVF outcomes', 'प्रजनन चिकित्सा और IVF परिणाम'),
                t('Acute stroke pathway in district care', 'जिला स्तर पर तीव्र स्ट्रोक मार्ग'),
                t(
                  'Neonatal sepsis surveillance',
                  'नवजात सेप्सिस निगरानी',
                ),
                t(
                  'Antimicrobial stewardship',
                  'एंटीमाइक्रोबियल स्टीवर्डशिप',
                ),
                t(
                  'Joint replacement registry',
                  'जोड़ प्रत्यारोपण रजिस्ट्री',
                ),
              ].map((s, i) => (
                <li
                  key={s}
                  className="border-rule rule-bottom flex items-baseline gap-4 py-3 text-base"
                >
                  <span className="text-ink-soft font-mono text-xs tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2 space-y-8 text-base text-ink leading-relaxed">
            <p>
              {t(
                'Research at Dev Nandini is not a parallel track; it is the way our consultants improve the wards and OPDs they actually run. We support short, well-designed studies with a clear answer in mind, and a publication discipline that asks every project to justify why the study mattered.',
                'देव नंदिनी में अनुसंधान कोई समानांतर पथ नहीं है; यह वह तरीक़ा है जिससे हमारे परामर्शदाता उन्हीं वार्डों और OPD में सुधार करते हैं जिन्हें वे प्रबंधित करते हैं। हम छोटे, सुगठित अध्ययनों का समर्थन करते हैं जिनका उत्तर पहले से स्पष्ट हो।',
              )}
            </p>
            <p>
              {t(
                'Fellows and PG residents are encouraged to bring a question from the bedside, scope it with a senior, and finish it within the academic year. The annual research day is an internal forum where every active project is briefly reviewed by peers.',
                'फ़ेलो और PG रेज़िडेंट्स को प्रोत्साहित किया जाता है कि वे बिस्तर के पास से कोई प्रश्न लाएँ, किसी वरिष्ठ के साथ उसका दायरा तय करें, और शैक्षणिक वर्ष के भीतर उसे पूरा करें। वार्षिक अनुसंधान दिवस एक आंतरिक मंच है जहाँ हर सक्रिय परियोजना की संक्षिप्त समीक्षा की जाती है।',
              )}
            </p>
            <p>
              {t(
                'Where we publish, we publish with full author lists and full methods. We do not subscribe to courtesy authorship.',
                'जहाँ हम प्रकाशित करते हैं, वहाँ हम पूर्ण लेखक सूची और पूर्ण विधियाँ प्रकाशित करते हैं। हम औपचारिक लेखकत्व के पक्षधर नहीं हैं।',
              )}
            </p>
            <p>
              <Link
                href="/contact"
                className="text-brand font-medium underline-offset-4 hover:underline"
              >
                {t('Contact the Academics office', 'शिक्षाविद कार्यालय से संपर्क करें')} →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
