interface BrandMarkProps {
  size?: number;        // pixel edge length; the mark is square
  glint?: string;       // optional facet fill for a subtle highlight
  strokeWidth?: number; // hairline weight, scaled with size by default
}

// Treasured's mark: a minimal, hairline faceted gem. Strokes inherit
// `currentColor` so it takes on whatever text color wraps it; one crown facet
// can be tinted via `glint` for a soft highlight. Sharp, geometric — no hearts.
export function BrandMark({ size = 16, glint, strokeWidth }: BrandMarkProps) {
  const sw = strokeWidth ?? Math.max(1, size / 14);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Left crown facet, optionally tinted as a glint. */}
      {glint && <path d="M6 4 L2 9 L9 9 Z" fill={glint} stroke="none" />}
      {/* Gem outline: table across the top, girdle shoulders, single point. */}
      <path d="M6 4 H18 L22 9 L12 21 L2 9 Z" />
      {/* Girdle. */}
      <path d="M2 9 H22" />
      {/* Crown + pavilion facets converging toward the point. */}
      <path d="M6 4 L9 9 L12 21" />
      <path d="M18 4 L15 9 L12 21" />
    </svg>
  );
}
