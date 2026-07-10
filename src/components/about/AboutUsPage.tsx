import { useTheme } from '../../context/ThemeContext';
import { BrandMark } from '../layout/BrandMark';

// SCREEN 4: "US" — an emotional, typographic introduction to Treasured.
// Deliberately minimal: a centered editorial statement, mono base with refined
// serif-italic accents on the phrases that carry the feeling. No cards, no
// shadows, no stock imagery — just type and generous space.
export function AboutUsPage() {
  const theme = useTheme();

  return (
    <section
      className="reveal-up"
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: 'clamp(32px, 8vw, 72px) 4px',
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', color: theme.accent }}>
        <BrandMark size={30} glint={theme.sun} />
      </div>

      <p
        style={{
          margin: '22px 0 0',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.32em',
          color: theme.muted,
        }}
      >
        Our story
      </p>

      <p
        style={{
          margin: 'clamp(20px, 5vw, 32px) auto 0',
          maxWidth: '30ch',
          fontSize: 'clamp(19px, 5.2vw, 27px)',
          lineHeight: 1.5,
          color: theme.ink,
          letterSpacing: '-0.01em',
        }}
      >
        Treasured is where we keep{' '}
        <span className="accent-serif" style={{ color: theme.accent, fontSize: '1.15em' }}>what matters</span>
        {' '}— the moments, memories, milestones, and plans we never want to lose. A shared space for our
        favorite photos,{' '}
        <span className="accent-serif" style={{ color: theme.muted, fontSize: '1.15em' }}>our journey together</span>,
        {' '}and all the little things that make{' '}
        <span className="accent-serif" style={{ color: theme.accent, fontSize: '1.15em' }}>our story uniquely ours.</span>
      </p>

      <div
        aria-hidden="true"
        style={{ width: '40px', height: '1px', backgroundColor: theme.line, margin: 'clamp(28px, 6vw, 44px) auto 0' }}
      />

      <p
        style={{
          margin: '18px 0 0',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.28em',
          color: theme.muted,
        }}
      >
        Est. 2026 · A shared keepsake
      </p>
    </section>
  );
}
