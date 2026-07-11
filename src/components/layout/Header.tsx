import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from './BrandMark';
import type { Tab } from '../../types';

interface HeaderProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'bucket', label: 'Bucket' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'milestones', label: 'Timeline' },
  { id: 'us', label: 'Us' },
];

// Compact per-tab masthead. Kept to a single line so the heading no longer eats
// most of the first screen on mobile.
const HEADINGS: Record<Tab, { title: string; tagline: string }> = {
  bucket: { title: 'Bucket list', tagline: 'Dream it, do it, remember it — together.' },
  gallery: { title: 'Gallery', tagline: 'Every favorite moment, in one place.' },
  milestones: { title: 'Timeline', tagline: 'Every milestone, the newest first.' },
  us: { title: 'Our story', tagline: 'Keep what matters, together.' },
};

// --- TOP BAR + MASTHEAD ---
export function Header({ activeTab, onChangeTab }: HeaderProps) {
  const theme = useTheme();
  const { signOut } = useAuth();
  const heading = HEADINGS[activeTab];

  return (
    <header className="reveal-up" style={{ position: 'relative', zIndex: 10, maxWidth: '760px', margin: '0 auto', padding: '24px 24px 0' }}>
      {/* Top bar: wordmark on the left, a clearly-outlined Sign out on the right
          so it never reads as just another nav tab. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', color: theme.ink }}>
          <BrandMark size={16} glint={theme.sun} />
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.32em', color: theme.muted }}>Treasured</span>
        </span>
        <button className="nav-signout" onClick={() => signOut()} title="Sign out">Sign&nbsp;out</button>
      </div>

      {/* Section tabs sit on their own hairline rail — scrolls sideways rather
          than wrapping into a tall block on narrow phones. */}
      <nav className="tab-rail" style={{ borderBottom: `1px solid ${theme.line}`, marginTop: '16px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onChangeTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Compact masthead. */}
      <div style={{ marginTop: '22px' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(22px, 6vw, 30px)', fontWeight: 400, lineHeight: 1.1, color: theme.ink, letterSpacing: '-0.01em' }}>
          {heading.title}
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: '14px', color: theme.muted }}>
          {heading.tagline}
        </p>
      </div>
    </header>
  );
}
