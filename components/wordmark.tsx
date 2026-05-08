import { cn } from '@/lib/cn';

/**
 * DNH wordmark — bilingual lockup.
 *
 * Two registers stacked or in line: a tight Latin abbreviation (DNH)
 * and the Devanagari full name (देव नंदिनी), separated by a thin
 * vertical hairline that doubles as the institutional rule. The mark
 * uses the same Tiro family as the rest of the typography contract,
 * so the wordmark sits inside the type system rather than next to it.
 *
 * SVG so it scales crisply, prints to one ink, and switches tone
 * (light or ink) for use on either surface or brand-deep backgrounds.
 */
type Tone = 'ink' | 'light';
type Variant = 'inline' | 'stacked';

export function Wordmark({
  tone = 'ink',
  size = 'md',
  variant = 'inline',
  className,
  showFull = false,
}: {
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  variant?: Variant;
  className?: string;
  showFull?: boolean;
}) {
  const sizePx = size === 'sm' ? 26 : size === 'lg' ? 56 : 38;
  const fg = tone === 'light' ? 'currentColor' : 'currentColor';
  const colorClass = tone === 'light' ? 'text-surface' : 'text-ink';
  const accentClass = tone === 'light' ? 'text-accent' : 'text-brand';

  if (variant === 'stacked') {
    return (
      <span className={cn('inline-flex flex-col leading-none', colorClass, className)}>
        <span
          aria-hidden
          className="font-display"
          style={{ fontSize: sizePx, letterSpacing: '-0.02em', color: fg }}
        >
          DNH
        </span>
        <span
          aria-hidden
          className="font-display"
          style={{ fontSize: sizePx * 0.5, letterSpacing: '0', marginTop: 4, color: fg }}
          lang="hi"
        >
          देव नंदिनी
        </span>
        {showFull ? <span className="sr-only">Dev Nandini Hospital and Medical College</span> : null}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-baseline gap-2.5', colorClass, className)}>
      <span
        aria-hidden
        className="font-display leading-none"
        style={{ fontSize: sizePx, letterSpacing: '-0.02em' }}
      >
        DNH
      </span>
      <span
        aria-hidden
        className={cn('inline-block leading-none', accentClass)}
        style={{
          width: 1,
          height: sizePx * 0.62,
          backgroundColor: 'currentColor',
          alignSelf: 'center',
        }}
      />
      <span
        aria-hidden
        className="font-display leading-none"
        style={{ fontSize: sizePx * 0.66, letterSpacing: '0' }}
        lang="hi"
      >
        देव नंदिनी
      </span>
      {showFull ? <span className="sr-only">Dev Nandini Hospital and Medical College</span> : null}
    </span>
  );
}
