import { useTheme } from '../../context/ThemeContext';

// SCREEN 3: STORIES SECTION (EDITORIAL ABOUT US DISPLAY)
export function AboutUsPage() {
  const theme = useTheme();

  return (
    <section
      className="reveal-up card-shadow"
      style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center', backgroundColor: theme.card, padding: '36px', borderRadius: '24px', border: `1px solid ${theme.line}` }}
    >
      <div>
        <p style={{ margin: '0 0 10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.25em', color: theme.muted }}>Our story</p>
        <h2 style={{ fontSize: '28px', margin: '0 0 16px 0', color: theme.ink }}>Our shared space</h2>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: theme.muted, margin: '0 0 24px 0' }}>
          An intentional digital sanctuary designed entirely out of view from regular algorithmic feeds. Here, milestones remain permanent, photos retain their raw contextual meanings, and lists progress gracefully forward in real-time sync.
        </p>
        <div style={{ display: 'inline-block', borderTop: `1px solid ${theme.accent}`, paddingTop: '12px' }}>
          <span style={{ fontSize: '11px', color: theme.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Twin log engine // live ecosystem</span>
        </div>
      </div>

      <div style={{ border: `1px solid ${theme.line}`, borderRadius: '16px', overflow: 'hidden', height: '280px', backgroundColor: theme.canvas }}>
        <img
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600"
          alt="Minimal narrative artwork representational accent window"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </section>
  );
}
