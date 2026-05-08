import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { ContactForm } from './contact-form';
import { site } from '@/lib/site';
import type { Locale } from '@/i18n/routing';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('nav');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  const desks: { name: string; phone: string }[] = [
    { name: t('Emergency / Ambulance', 'आपातकाल / एम्बुलेंस'), phone: site.emergencyPhone },
    { name: t('Outpatient (OPD)', 'बाह्य रोगी (OPD)'), phone: site.phones[1] },
    { name: t('Admissions (Academics)', 'प्रवेश (शिक्षाविद)'), phone: site.phones[0] },
    { name: t('Blood Bank, 24x7', 'रक्त बैंक, 24x7'), phone: site.phones[1] },
    { name: t('Lab and Imaging', 'प्रयोगशाला और इमेजिंग'), phone: site.phones[0] },
    { name: t('Billing / Insurance', 'बिलिंग / बीमा'), phone: site.phones[1] },
  ];

  return (
    <>
      <PageHeader
        eyebrow={tNav('contact')}
        title={t('Contact and locations', 'सम्पर्क और स्थान')}
        lede={t(
          'Direct dials per desk. For emergencies, please call rather than email.',
          'प्रत्येक डेस्क के लिए सीधा डायल। आपातकाल में कृपया ईमेल के बजाय कॉल करें।',
        )}
      />

      {/* Address + map placeholder */}
      <section className="rule-bottom bg-surface">
        <div className="container-wide py-section grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="eyebrow text-brand">{t('Address', 'पता')}</span>
            <address className="text-ink not-italic mt-6 text-2xl font-display leading-snug">
              {site.address[locale]}
            </address>
            <p className="text-ink-mute mt-6 text-sm leading-relaxed">
              {t(
                'OPD entrance on Garh Road. The emergency entrance is on the railway side and is signed in red.',
                'OPD प्रवेश गढ़ रोड पर। आपातकालीन प्रवेश रेलवे की ओर है और लाल रंग में अंकित है।',
              )}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="text-brand mt-8 inline-block underline-offset-4 hover:underline"
            >
              {site.email}
            </a>
          </div>
          {/* Static map placeholder — replaced in phase 6 with embedded map */}
          <div
            aria-hidden
            className="bg-surface-deep relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1400&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'grayscale(100%) contrast(1.05)',
            }}
          />
        </div>
      </section>

      {/* Department-wise phones */}
      <section className="rule-bottom bg-surface-mute">
        <div className="container-wide py-section">
          <span className="eyebrow text-brand">{t('Direct dials', 'सीधा डायल')}</span>
          <h2 className="font-display text-ink mt-3 text-3xl">
            {t('Department-wise phones', 'विभाग-वार फ़ोन')}
          </h2>
          <ul className="mt-10 grid gap-x-12 gap-y-0 sm:grid-cols-2">
            {desks.map((d) => (
              <li
                key={d.name}
                className="border-rule rule-bottom flex items-baseline justify-between gap-6 py-5"
              >
                <span className="text-ink text-base">{d.name}</span>
                <a
                  href={`tel:${d.phone}`}
                  className="text-ink hover:text-brand font-mono text-base tabular-nums"
                >
                  {d.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Inquiry form */}
      <section className="bg-surface">
        <div className="container-wide py-section grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="eyebrow text-brand">
              {t('Inquiry form', 'पूछताछ फ़ॉर्म')}
            </span>
            <h2 className="font-display text-ink mt-3 text-3xl">
              {t('Write to the institution', 'संस्थान को लिखें')}
            </h2>
            <p className="text-ink-mute mt-4 max-w-prose text-base leading-relaxed">
              {t(
                'For non-urgent questions, programme inquiries, and partnership requests. We typically reply within two working days.',
                'गैर-तत्काल प्रश्नों, पाठ्यक्रम पूछताछ और साझेदारी अनुरोधों के लिए। हम सामान्यतः दो कार्यदिवसों में उत्तर देते हैं।',
              )}
            </p>
          </div>
          <ContactForm
            labels={{
              name: t('Name', 'नाम'),
              email: t('Email', 'ईमेल'),
              phone: t('Phone (optional)', 'फ़ोन (वैकल्पिक)'),
              topic: t('Topic', 'विषय'),
              topicOptions: [
                t('Appointment / care', 'अपॉइंटमेंट / देखभाल'),
                t('Admissions / academics', 'प्रवेश / शिक्षाविद'),
                t('Press / partnership', 'प्रेस / साझेदारी'),
                t('Other', 'अन्य'),
              ],
              message: t('Message', 'संदेश'),
              submit: t('Send', 'भेजें'),
              thankYou: t(
                'Thank you. The relevant desk will reply by email within two working days.',
                'धन्यवाद। संबंधित डेस्क दो कार्यदिवसों में ईमेल द्वारा उत्तर देगा।',
              ),
              error: t(
                'Something went wrong. Please try again or call the OPD line.',
                'कुछ ग़लत हो गया। कृपया पुनः प्रयास करें या OPD लाइन पर कॉल करें।',
              ),
            }}
          />
        </div>
      </section>
    </>
  );
}
