import Script from 'next/script';

/**
 * Plausible analytics.
 *
 * Privacy-friendly: no cookies, no personal data, GDPR/DPDP compatible
 * out of the box. Loaded only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set
 * so dev environments stay quiet.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
