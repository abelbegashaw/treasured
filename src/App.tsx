import { useState } from 'react';
import './App.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { Header } from './components/layout/Header';
import { LoginPage } from './components/auth/LoginPage';
import { BucketListPage } from './components/bucket-list/BucketListPage';
import { GalleryPage } from './components/gallery/GalleryPage';
import { MilestonesPage } from './components/milestones/MilestonesPage';
import { AboutUsPage } from './components/about/AboutUsPage';
import type { Tab } from './types';

function AppShell() {
  const theme = useTheme();

  // --- COMPONENT VIEWS CONTROL STATE ---
  const [activeTab, setActiveTab] = useState<Tab>('bucket');

  // The "Us" page is a single, non-scrolling screen; every other tab scrolls
  // inside the frame below. Because scrolling happens in an inner container (not
  // the body), the top bar can be sticky and the ambient backdrop stays fixed.
  const isUs = activeTab === 'us';

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: theme.canvas, color: theme.ink, fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
      <GlobalStyles />
      <AmbientBackground />

      {/* Scroll frame — the sticky top bar sticks to the top of THIS element. */}
      <div style={{ position: 'relative', zIndex: 10, flex: '1 1 auto', minHeight: 0, overflowX: 'hidden', overflowY: isUs ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        <Header activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* --- WORKSPACE LAYOUT PANELS --- */}
        <main
          style={{
            width: '100%',
            maxWidth: '760px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            ...(isUs
              ? { flex: '1 1 auto', minHeight: 0, justifyContent: 'center', padding: '8px 24px 24px' }
              : { padding: '28px 24px 72px' }),
          }}
        >
          {activeTab === 'bucket' && <BucketListPage />}
          {activeTab === 'gallery' && <GalleryPage />}
          {activeTab === 'milestones' && <MilestonesPage />}
          {isUs && <AboutUsPage />}
        </main>
      </div>
    </div>
  );
}

// Decides between the login screen and the app based on the Supabase session.
function AuthGate() {
  const theme = useTheme();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.canvas, color: theme.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
        Loading…
      </div>
    );
  }

  return session ? <AppShell /> : <LoginPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
