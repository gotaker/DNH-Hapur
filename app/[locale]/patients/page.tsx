import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/page-header';
import type { Locale } from '@/i18n/routing';

export default async function PatientsPage({
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
      href: '/patients/departments',
      label: tNav('departments'),
      body: t(
        'Browse all clinical departments — from cardiology and IVF to orthopaedics and dermatology.',
        'सभी नैदानिक विभाग देखें — हृदय रोग और IVF से लेकर हड्डी रोग और त्वचा रोग तक।',
      ),
    },
    {
      href: '/patients/doctors',
      label: tNav('doctors'),
      body: t(
        'Search physicians by specialty, name, or department. See OPD timings and book.',
        'विशेषज्ञता, नाम या विभाग द्वारा चिकित्सक खोजें। OPD समय देखें और अपॉइंटमेंट लें।',
      ),
    },
    {
      href: '/patients/emergency',
      label: tNav('emergency'),
      body: t(
        'Round-the-clock emergency care, ambulance, and the institutional contact lines for crises.',
        'चौबीसों घंटे आपातकालीन देखभाल, एम्बुलेंस और संकट के लिए संस्थागत सम्पर्क पंक्तियाँ।',
      ),
    },
    {
      href: '/contact',
      label: tNav('contact'),
      body: t(
        'Department-wise phones, address, and the inquiry form — for non-urgent questions.',
        'विभाग-वार फ़ोन, पता और पूछताछ फ़ॉर्म — गैर-तत्काल प्रश्नों के लिए।',
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={tNav('patients')}
        title={t('Patients & Visitors', 'मरीज़ और परिजन')}
        lede={t(
          'Everything a patient or family member needs before, during, and after a visit. Pick a section.',
          'मुलाक़ात से पहले, दौरान और बाद में मरीज़ या परिजन को आवश्यक सब कुछ। एक अनुभाग चुनें।',
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
