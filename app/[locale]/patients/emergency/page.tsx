import { setRequestLocale, getTranslations } from 'next-intl/server';
import { site } from '@/lib/site';
import { PrintButton } from './print-button';
import type { Locale } from '@/i18n/routing';

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tActions = await getTranslations('actions');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  return (
    <>
      {/* Big CTA — built print-friendly. The print stylesheet (phase 7)
          collapses navigation and footer chrome and prints just this page. */}
      <section className="bg-brand text-surface print:bg-surface print:text-ink">
        <div className="container-wide py-section">
          <span className="eyebrow text-accent print:text-brand">
            {tActions('emergency24x7')}
          </span>
          <h1 className="font-display mt-4 text-6xl leading-[1.02] tracking-tight">
            {t('Call us. Now.', 'अभी कॉल करें।')}
          </h1>
          <a
            href={`tel:${site.emergencyPhone}`}
            className="font-mono mt-10 inline-block text-7xl tabular-nums underline-offset-8 hover:underline"
          >
            {site.emergencyPhone}
          </a>
          <p className="mt-6 max-w-2xl text-lg opacity-90 print:opacity-100">
            {t(
              'Round-the-clock emergency, ICU, NICU, and 24x7 blood bank. An ambulance is on the road in minutes.',
              'चौबीसों घंटे आपातकाल, ICU, NICU और 24x7 रक्त बैंक। मिनटों में एम्बुलेंस आपके पास।',
            )}
          </p>
          <PrintButton
            label={t('Print this page', 'इस पेज को प्रिंट करें')}
          />
        </div>
      </section>

      <section className="bg-surface">
        <div className="container-wide py-section grid gap-12 lg:grid-cols-3">
          <div>
            <span className="eyebrow text-brand">
              {t('What to do first', 'सबसे पहले क्या करें')}
            </span>
            <ol className="text-ink mt-6 space-y-5 text-base">
              <li className="border-rule rule-bottom flex gap-4 pb-5">
                <span className="text-ink-soft font-mono text-xs tabular-nums">01</span>
                <span>
                  {t(
                    'Call our emergency line and stay on the call until told to hang up.',
                    'हमारी आपातकालीन लाइन पर कॉल करें और निर्देश मिलने तक कॉल पर रहें।',
                  )}
                </span>
              </li>
              <li className="border-rule rule-bottom flex gap-4 pb-5">
                <span className="text-ink-soft font-mono text-xs tabular-nums">02</span>
                <span>
                  {t(
                    'Share the patient\u2019s age, presenting complaint, and your distance from the hospital.',
                    'मरीज़ की आयु, मुख्य शिकायत और अस्पताल से आपकी दूरी बताएँ।',
                  )}
                </span>
              </li>
              <li className="flex gap-4 pb-2">
                <span className="text-ink-soft font-mono text-xs tabular-nums">03</span>
                <span>
                  {t(
                    'If asked to come in, bring any past medical records, ongoing medicines, and an Aadhaar / ID.',
                    'यदि आने को कहा जाए, तो पुराने मेडिकल रिकॉर्ड, चल रही दवाइयाँ और आधार / पहचान पत्र साथ लाएँ।',
                  )}
                </span>
              </li>
            </ol>
          </div>

          <div>
            <span className="eyebrow text-brand">
              {t('Contact lines', 'सम्पर्क पंक्तियाँ')}
            </span>
            <dl className="mt-6 space-y-5 text-base">
              <div>
                <dt className="eyebrow text-ink-mute">
                  {t('Emergency / Ambulance', 'आपातकाल / एम्बुलेंस')}
                </dt>
                <dd className="font-mono text-ink mt-1 text-2xl">
                  <a href={`tel:${site.emergencyPhone}`}>{site.emergencyPhone}</a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-mute">{t('OPD', 'OPD')}</dt>
                <dd className="font-mono text-ink mt-1 text-2xl">
                  <a href={`tel:${site.phones[1]}`}>{site.phones[1]}</a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-mute">WhatsApp</dt>
                <dd className="text-ink mt-1 text-base">
                  <a
                    href={`https://wa.me/${site.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand underline-offset-4 hover:underline"
                  >
                    +{site.whatsapp.slice(0, 2)} {site.whatsapp.slice(2, 7)} {site.whatsapp.slice(7)}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <span className="eyebrow text-brand">{t('Where to come', 'कहाँ आएँ')}</span>
            <address className="text-ink not-italic mt-6 text-base leading-relaxed">
              {site.address[locale]}
            </address>
            <p className="text-ink-mute mt-6 text-sm">
              {t(
                'The emergency entrance is on the Garh Road side, marked in red. Do not park; pull up to the gate.',
                'आपातकालीन प्रवेश गढ़ रोड की ओर है, लाल रंग में अंकित। पार्क न करें; गेट तक सीधे आएँ।',
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
