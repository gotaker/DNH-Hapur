import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { PageHeader } from '@/components/page-header';
import { programs } from '@/content/data/programs';
import { pick } from '@/content/data/types';
import { localizedHref } from '@/lib/href';
import type { Locale } from '@/i18n/routing';

export default async function AdmissionsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('nav');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  return (
    <>
      <PageHeader
        eyebrow={tNav('academics')}
        title={t('Admissions 2026', 'प्रवेश 2026')}
        lede={t(
          'Counselling-led for NMC and INC programs; direct application for FOGSI fellowships and short courses. Calendar, eligibility, and the institution\u2019s admissions ethic below.',
          'NMC और INC पाठ्यक्रमों के लिए काउंसलिंग-आधारित; FOGSI फ़ेलोशिप और लघु पाठ्यक्रमों के लिए सीधा आवेदन। नीचे कैलेंडर, पात्रता और संस्थान की प्रवेश-नीति।',
        )}
      />

      {/* Calendar */}
      <section className="rule-bottom bg-surface">
        <div className="container-wide py-section">
          <span className="eyebrow text-brand">
            {t('Admissions calendar', 'प्रवेश कैलेंडर')}
          </span>
          <ol className="mt-10 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                k: t('Apr–May', 'अप्रैल–मई'),
                v: t('NEET-UG / NEET-PG results', 'NEET-UG / NEET-PG परिणाम'),
              },
              {
                k: t('Jun', 'जून'),
                v: t('State counselling round 1', 'राज्य काउंसलिंग — पहला चरण'),
              },
              {
                k: t('Jul', 'जुलाई'),
                v: t(
                  'FOGSI fellowship applications open',
                  'FOGSI फ़ेलोशिप आवेदन शुरू',
                ),
              },
              {
                k: t('Aug', 'अगस्त'),
                v: t('Session begins', 'सत्र आरंभ'),
              },
            ].map((s) => (
              <li key={s.k} className="bg-surface p-6">
                <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">
                  {s.k}
                </span>
                <p className="text-ink mt-3 text-base leading-snug">{s.v}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Eligibility table by program */}
      <section className="rule-bottom bg-surface-mute">
        <div className="container-wide py-section">
          <span className="eyebrow text-brand">
            {t('Eligibility, by program', 'पात्रता, प्रति पाठ्यक्रम')}
          </span>
          <div className="border-rule mt-10 overflow-x-auto border">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-surface">
                <tr className="border-rule border-b">
                  <th className="eyebrow text-ink-mute px-4 py-4">
                    {t('Program', 'पाठ्यक्रम')}
                  </th>
                  <th className="eyebrow text-ink-mute px-4 py-4">
                    {t('Duration', 'अवधि')}
                  </th>
                  <th className="eyebrow text-ink-mute px-4 py-4 text-right">
                    {t('Seats', 'सीटें')}
                  </th>
                  <th className="eyebrow text-ink-mute px-4 py-4">
                    {t('Accreditation', 'मान्यता')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr
                    key={p.slug.en}
                    className="border-rule bg-surface border-b last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={localizedHref('/academics/programs', p.slug, locale)}
                        className="text-ink hover:text-brand font-medium"
                      >
                        {pick(p.title, locale)}
                      </Link>
                    </td>
                    <td className="text-ink-mute px-4 py-4">{pick(p.duration, locale)}</td>
                    <td className="text-ink px-4 py-4 text-right font-mono tabular-nums">
                      {p.intake}
                    </td>
                    <td className="text-ink-mute px-4 py-4 font-mono">{p.accreditation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="rule-bottom bg-surface">
        <div className="container-wide py-section grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <span className="eyebrow text-brand">FAQ</span>
            <h2 className="font-display text-ink mt-3 text-3xl">
              {t('Common questions', 'सामान्य प्रश्न')}
            </h2>
          </div>
          <Accordion type="single" collapsible className="border-rule border-t">
            {[
              {
                q: t(
                  'Do you accept management quota or capitation fees?',
                  'क्या आप मैनेजमेंट कोटा या कैपिटेशन शुल्क लेते हैं?',
                ),
                a: t(
                  'No. Counselling-led admissions follow the State Counselling Authority. The institution does not collect any payment outside the published fee.',
                  'नहीं। काउंसलिंग-आधारित प्रवेश राज्य काउंसलिंग प्राधिकरण के माध्यम से होते हैं। संस्थान प्रकाशित शुल्क के अतिरिक्त कोई भुगतान नहीं लेता।',
                ),
              },
              {
                q: t('Are scholarships available?', 'क्या छात्रवृत्तियाँ उपलब्ध हैं?'),
                a: t(
                  'Government scholarships apply per state rules. The institution also offers a small need-based bursary for the GNM nursing program.',
                  'सरकारी छात्रवृत्तियाँ राज्य नियमों के अनुसार लागू होती हैं। GNM नर्सिंग कार्यक्रम के लिए संस्थान एक छोटी आवश्यकता-आधारित बर्सरी भी प्रदान करता है।',
                ),
              },
              {
                q: t(
                  'Where can I download the prospectus?',
                  'मैं प्रॉस्पेक्टस कहाँ डाउनलोड कर सकता हूँ?',
                ),
                a: t(
                  'Each program detail page lists the current prospectus once admissions open for that cohort.',
                  'प्रवेश खुलने पर प्रत्येक पाठ्यक्रम पृष्ठ पर वर्तमान प्रॉस्पेक्टस सूचीबद्ध होता है।',
                ),
              },
              {
                q: t(
                  'Whom do I contact with admissions questions?',
                  'प्रवेश-संबंधी प्रश्नों के लिए मैं किससे संपर्क करूँ?',
                ),
                a: t(
                  'Use the contact form on this site or call the OPD line and ask for the Academics office.',
                  'इस साइट के संपर्क फ़ॉर्म का उपयोग करें या OPD लाइन पर कॉल करके शिक्षाविद कार्यालय से बात करें।',
                ),
              },
            ].map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-deep text-surface">
        <div className="container-wide py-section flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow text-accent">{t('Next step', 'अगला कदम')}</span>
            <h2 className="font-display mt-3 text-4xl leading-tight">
              {t('Talk to the Academics office', 'शिक्षाविद कार्यालय से बात करें')}
            </h2>
          </div>
          <Button asChild size="lg" variant="accent">
            <Link href="/contact">{t('Contact admissions', 'प्रवेश से संपर्क')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
