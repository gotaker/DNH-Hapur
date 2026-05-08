import Image from 'next/image';
import { cn } from '@/lib/cn';

import logoSrc from '../public/brand/dnh-logo.png';

/**
 * DNH wordmark — horizontal lockup PNG.
 *
 * The institutional mark is a fixed-art lockup (arrow/house glyph + the
 * Latin wordmark "DEVNANDINI HOSPITAL"). We render it as an Image so it
 * remains pixel-faithful to the source artwork; sizing is controlled by
 * height (the image keeps its native aspect ratio).
 *
 * The `tone` and `variant` props are kept for backward-compatibility with
 * the prior typographic wordmark, but the artwork itself does not change
 * between them. On dark surfaces, callers should ensure the logo has
 * enough contrast (the artwork is brand-blue on transparent).
 */
type Tone = 'ink' | 'light';
type Variant = 'inline' | 'stacked';

const HEIGHTS: Record<'sm' | 'md' | 'lg', number> = {
  sm: 28,
  md: 40,
  lg: 60,
};

const ASPECT = 450 / 71;

export function Wordmark({
  tone: _tone = 'ink',
  size = 'md',
  variant: _variant = 'inline',
  className,
  showFull = false,
}: {
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  variant?: Variant;
  className?: string;
  showFull?: boolean;
}) {
  const height = HEIGHTS[size];
  const width = Math.round(height * ASPECT);

  return (
    <span className={cn('inline-flex items-center', className)}>
      <Image
        src={logoSrc}
        alt="Devnandini Hospital"
        width={width}
        height={height}
        priority
        sizes={`${width}px`}
        style={{ height, width: 'auto' }}
      />
      {showFull ? (
        <span className="sr-only">Dev Nandini Hospital and Medical College</span>
      ) : null}
    </span>
  );
}
