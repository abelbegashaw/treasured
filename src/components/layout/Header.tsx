import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from './BrandMark';
import type { Tab } from '../../types';

interface HeaderProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
}

// The masthead title + tagline are per-tab: the bucket list keeps its own
// heading, and every other page gets one that fits its content.
const HEADINGS: Record<Tab, { title: ReactNode; tagline: string }> = {
  bucket: { title: <>Our shared<br />bucket list</>, tagline: 'Dream it together, do it together, remember it forever.' },
  gallery: { title: <>Our photo<br />gallery</>, tagline: 'Every favorite moment, in one place.' },
  milestones: { title: <>Our<br />timeline</>, tagline: 'Every milestone, the newest first.' },
  us: { title: <>Our<br />story</>, tagline: 'Keep what matters, together.' },
};

// --- PRESERVED NAVIGATION HEADER ---
export function Header({ activeTab, onChangeTab }: HeaderProps) {
  const theme = useTheme();
  const { signOut } = useAuth();
  const heading = HEADINGS[activeTab];

  return (
    <header className="reveal-up" style={{ position: 'relative', zIndex: 10, maxWidth: '760px', margin: '0 auto', padding: '48px 24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px 20px', paddingBottom: '18px', borderBottom: `1px solid ${theme.line}` }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', color: theme.ink }}>
          <BrandMark size={16} glint={theme.sun} />
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.32em', color: theme.muted }}>Treasured</span>
        </span>
        {/* One wrapping row of links: on a wide screen it sits right of the
            wordmark; on mobile the whole group drops to its own line and wraps
            left-aligned, so every item — Sign out included — stays visible. */}
        <nav style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'clamp(14px, 4vw, 22px)' }}>
          <button className={`nav-pill ${activeTab === 'bucket' ? 'active' : ''}`} onClick={() => onChangeTab('bucket')}>Bucket</button>
          <button className={`nav-pill ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => onChangeTab('gallery')}>Gallery</button>
          <button className={`nav-pill ${activeTab === 'milestones' ? 'active' : ''}`} onClick={() => onChangeTab('milestones')}>Timeline</button>
          <button className={`nav-pill ${activeTab === 'us' ? 'active' : ''}`} onClick={() => onChangeTab('us')}>Us</button>
          <button className="nav-pill" onClick={() => signOut()} title="Sign out" style={{ color: theme.muted }}>Sign&nbsp;out</button>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginTop: '32px' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(28px, 8vw, 40px)', fontWeight: 400, lineHeight: 1.1, color: theme.ink, letterSpacing: '-0.01em' }}>
          {heading.title}
        </h1>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme.muted, paddingBottom: '6px' }}>Est. 2026</span>
      </div>
      <p style={{ marginTop: '14px', marginBottom: 0, fontSize: '15px', color: theme.muted }}>
        {heading.tagline}
      </p>
    </header>
  );
}
