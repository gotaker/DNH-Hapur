import Image from 'next/image';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { site } from '@/lib/site';
import { leadership } from '@/content/data/leadership';
import { pick } from '@/content/data/types';
import type { Locale } from '@/i18n/routing';

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('nav');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  const established = site.established;
  const yearsActive = new Date().getFullYear() - established;

  return (
    <>
      <PageHeader
        eyebrow={tNav('about')}
        title={t('A teaching hospital in Hapur', 'हापुड़ का एक शिक्षण अस्पताल')}
        lede={t(
          `Dev Nandini Hospital has served Hapur and Western Uttar Pradesh since ${established}. The institution now runs a tertiary-care hospital and a medical college on a single campus.`,
          `देव नंदिनी अस्पताल ${established} से हापुड़ और पश्चिमी उत्तर प्रदेश की सेवा कर रहा है। आज संस्थान एक ही परिसर में तृतीयक देखभाल अस्पताल और चिकित्सा महाविद्यालय चलाता है।`,
        )}
        meta={
          <dl className="grid grid-cols-3 gap-x-8 gap-y-4 max-w-lg">
            <div>
              <dt className="eyebrow text-ink-mute">{t('Founded', 'स्थापित')}</dt>
              <dd className="font-display text-ink mt-1 text-3xl tabular-nums">{established}</dd>
            </div>
            <div>
              <dt className="eyebrow text-ink-mute">{t('Years active', 'सक्रिय वर्ष')}</dt>
              <dd className="font-display text-ink mt-1 text-3xl tabular-nums">
                {yearsActive}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-ink-mute">{t('Specialties', 'विशेषज्ञताएँ')}</dt>
              <dd className="font-display text-ink mt-1 text-3xl tabular-nums">30+</dd>
            </div>
          </dl>
        }
      />

      <section className="bg-surface">
        <div className="container-wide py-section grid gap-16 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <span className="eyebrow text-brand">{t('Mission', 'मिशन')}</span>
            <h2 className="font-display text-ink mt-3 text-3xl">
              {t(
                'Serious care close to home',
                'घर के पास, गंभीर देखभाल',
              )}
            </h2>
          </div>
          <div className="space-y-6 text-base text-ink leading-relaxed max-w-prose">
            <p>
              {t(
                'For a family in Western UP, getting to a tertiary-care hospital used to mean a four-hour drive to Delhi. Dev Nandini Hospital exists to shrink that distance — to put credible neurosurgery, IVF, neonatal care, and joint replacement within reach of the towns and villages we share a postcode with.',
                'पश्चिमी उत्तर प्रदेश के किसी परिवार के लिए, तृतीयक देखभाल अस्पताल पहुँचने का अर्थ चार घंटे की दिल्ली यात्रा हुआ करता था। देव नंदिनी अस्पताल इसी दूरी को कम करने के लिए मौजूद है — विश्वसनीय न्यूरोसर्जरी, IVF, नवजात देखभाल और जोड़-प्रत्यारोपण को उन्हीं कस्बों और गाँवों के पास लाने के लिए जिनसे हम एक ही पिनकोड साझा करते हैं।',
              )}
            </p>
            <p>
              {t(
                'We do not aspire to be a luxury hospital. We aspire to be a serious one — one that listens carefully, explains in the language of the household, and makes its costs and limits clear up front.',
                'हम विलासितापूर्ण अस्पताल बनने की आकांक्षा नहीं रखते। हम एक गंभीर अस्पताल बनने की आकांक्षा रखते हैं — जो ध्यान से सुने, घर की भाषा में समझाए, और अपनी लागतें तथा सीमाएँ पहले से स्पष्ट कर दे।',
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="rule-bottom bg-surface-mute">
        <div className="container-wide py-section grid gap-16 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <span className="eyebrow text-brand">{t('How we work', 'हमारा कार्य-तंत्र')}</span>
            <h2 className="font-display text-ink mt-3 text-3xl">
              {t('Five working principles', 'पाँच कार्य-सिद्धांत')}
            </h2>
          </div>
          <ol className="space-y-0 text-base text-ink">
            {[
              {
                k: t('Patient first', 'मरीज़ पहले'),
                v: t(
                  'Every clinical decision starts from what the patient and their family actually need.',
                  'हर नैदानिक निर्णय इस बात से आरंभ होता है कि मरीज़ और उनके परिवार को वास्तव में क्या चाहिए।',
                ),
              },
              {
                k: t('Honest costs', 'पारदर्शी शुल्क'),
                v: t(
                  'Estimates are written down and explained before procedures, not after.',
                  'अनुमानित शुल्क प्रक्रिया से पहले लिखित रूप में दिए और समझाए जाते हैं, बाद में नहीं।',
                ),
              },
              {
                k: t('Antibiotic stewardship', 'एंटीबायोटिक स्टीवर्डशिप'),
                v: t(
                  'A formal stewardship programme prevents reflex prescriptions and tracks resistance.',
                  'एक औपचारिक स्टीवर्डशिप कार्यक्रम प्रतिक्रियात्मक नुस्खों को रोकता है और प्रतिरोध की निगरानी करता है।',
                ),
              },
              {
                k: t('No commission', 'कोई कमीशन नहीं'),
                v: t(
                  'We do not pay or receive commissions for referrals. Doctors send patients to us only because they trust us.',
                  'रेफ़रल के लिए हम कोई कमीशन नहीं देते या लेते। चिकित्सक मरीज़ हमें केवल इसलिए भेजते हैं क्योंकि वे हम पर भरोसा करते हैं।',
                ),
              },
              {
                k: t('Teach to learn', 'पढ़ाने के लिए सीखो'),
                v: t(
                  'A teaching hospital is a sharper hospital. Residents and fellows are part of every team.',
                  'शिक्षण-अस्पताल अधिक सतर्क अस्पताल होता है। हर टीम में रेज़िडेंट्स और फ़ेलोज़ शामिल होते हैं।',
                ),
              },
            ].map((p, i) => (
              <li
                key={p.k}
                className="border-rule rule-bottom grid grid-cols-[3rem_minmax(0,1fr)] gap-6 py-6 last:border-b"
              >
                <span className="text-ink-soft font-mono text-xs tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-ink text-xl leading-snug">{p.k}</h3>
                  <p className="text-ink-mute mt-2 max-w-prose text-sm leading-relaxed">{p.v}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-surface">
        <div className="container-wide py-section">
          <header className="grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:items-end">
            <div>
              <span className="eyebrow text-brand">{t('Leadership', 'नेतृत्व')}</span>
              <h2 className="font-display text-ink mt-3 text-3xl">
                {t('Trustees and management', 'न्यासी और प्रबंधन')}
              </h2>
            </div>
            <p className="text-ink-mute max-w-prose text-base leading-relaxed">
              {t(
                'The trust and management group that stewards Dev Nandini Hospital and Medical College.',
                'देव नंदिनी अस्पताल और चिकित्सा महाविद्यालय का संचालन करने वाला न्यास एवं प्रबंधन समूह।',
              )}
            </p>
          </header>
          <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {leadership.map((m) => (
              <li key={m.slug} className="flex flex-col">
                <div className="bg-surface-deep relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={m.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover grayscale"
                  />
                </div>
                <h3 className="font-display text-ink mt-4 text-lg leading-snug">
                  {pick(m.name, locale)}
                </h3>
                {m.role ? (
                  <p className="text-ink-mute mt-1 text-sm">{pick(m.role, locale)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
