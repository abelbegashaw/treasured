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

// Compact per-tab masthead. Single line so it never eats the first screen. The
// Us tab has no masthead — its own centered statement is the whole screen.
const HEADINGS: Record<Tab, { title: string; tagline: string }> = {
  bucket: { title: 'Bucket list', tagline: 'Dream it, do it, remember it — together.' },
  gallery: { title: 'Gallery', tagline: 'Every favorite moment, in one place.' },
  milestones: { title: 'Timeline', tagline: 'Every milestone, the newest first.' },
  us: { title: 'Our story', tagline: 'Keep what matters, together.' },
};

// --- STICKY TOP BAR + MASTHEAD ---
export function Header({ activeTab, onChangeTab }: HeaderProps) {
  const theme = useTheme();
  const { signOut } = useAuth();
  const heading = HEADINGS[activeTab];

  return (
    <header>
      {/* Frosted top bar — full-bleed, stays pinned while content scrolls under
          it. Two tiers so nothing is cramped on a phone: wordmark + Sign out on
          top, the section tabs on their own scrollable rail below. */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backgroundColor: 'transparent',
        }}
      >
        <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '13px 0 9px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', color: theme.ink }}>
              <BrandMark size={17} glint={theme.sun} />
              <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.34em', color: theme.ink }}>Treasured</span>
            </span>
            <button className="nav-signout" onClick={() => signOut()} title="Sign out">Sign&nbsp;out</button>
          </div>
          <nav className="tab-rail">
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
        </div>
      </div>

      {/* Per-tab masthead (skipped on Us). */}
      {activeTab !== 'us' && (
        <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto', padding: '26px 24px 0' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 6vw, 30px)', fontWeight: 400, lineHeight: 1.1, color: theme.ink, letterSpacing: '-0.01em' }}>
            {heading.title}
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: theme.muted }}>
            {heading.tagline}
          </p>
        </div>
      )}
    </header>
  );
}
