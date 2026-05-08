/**
 * PageHeader — the standard top of every inner template.
 *
 * Editorial hero with eyebrow + headline + lede, anchored on a hairline rule.
 * Inner pages share this shape so the home page can be visually distinct.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  meta?: React.ReactNode;
}) {
  return (
    <section className="rule-bottom bg-surface">
      <div className="container-wide pt-section pb-section-tight">
        {eyebrow ? <span className="eyebrow text-brand">{eyebrow}</span> : null}
        <h1
          className="font-display text-ink mt-4 max-w-4xl text-5xl leading-[1.05] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          {title}
        </h1>
        {lede ? (
          <p className="text-ink-mute mt-6 max-w-2xl text-lg leading-relaxed">{lede}</p>
        ) : null}
        {meta ? <div className="mt-8">{meta}</div> : null}
      </div>
    </section>
  );
}
