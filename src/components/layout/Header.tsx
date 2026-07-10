import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from './BrandMark';
import type { Tab } from '../../types';

interface HeaderProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
}

// --- PRESERVED NAVIGATION HEADER ---
export function Header({ activeTab, onChangeTab }: HeaderProps) {
  const theme = useTheme();
  const { signOut } = useAuth();

  return (
    <header className="reveal-up" style={{ position: 'relative', zIndex: 10, maxWidth: '760px', margin: '0 auto', padding: '48px 24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingBottom: '18px', borderBottom: `1px solid ${theme.line}` }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', color: theme.ink }}>
          <BrandMark size={16} glint={theme.sun} />
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.32em', color: theme.muted }}>Treasured</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <nav style={{ display: 'flex', gap: '22px' }}>
            <button className={`nav-pill ${activeTab === 'bucket' ? 'active' : ''}`} onClick={() => onChangeTab('bucket')}>Bucket</button>
            <button className={`nav-pill ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => onChangeTab('gallery')}>Gallery</button>
            <button className={`nav-pill ${activeTab === 'milestones' ? 'active' : ''}`} onClick={() => onChangeTab('milestones')}>Timeline</button>
            <button className={`nav-pill ${activeTab === 'us' ? 'active' : ''}`} onClick={() => onChangeTab('us')}>Us</button>
          </nav>
          <button className="nav-pill" onClick={() => signOut()} title="Sign out">Sign&nbsp;out</button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginTop: '32px' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(28px, 8vw, 40px)', fontWeight: 400, lineHeight: 1.1, color: theme.ink, letterSpacing: '-0.01em' }}>
          Our shared<br />bucket list
        </h1>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme.muted, paddingBottom: '6px' }}>Est. 2026</span>
      </div>
      <p style={{ marginTop: '14px', marginBottom: 0, fontSize: '15px', color: theme.muted }}>
        Keep what matters, together.
      </p>
    </header>
  );
}
