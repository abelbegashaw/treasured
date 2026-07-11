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

  // The "Us" page is a single, non-scrolling screen: the shell locks to the
  // viewport height and its content area fills the space under the header and
  // centers. Every other tab keeps normal document scrolling.
  const isUs = activeTab === 'us';

  return (
    <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: isUs ? '100dvh' : '100vh', height: isUs ? '100dvh' : undefined, backgroundColor: theme.canvas, color: theme.ink, fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
      <GlobalStyles />
      <AmbientBackground />
      <Header activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* --- WORKSPACE LAYOUT PANELS --- */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          ...(isUs
            ? { flex: '1 1 auto', minHeight: 0, justifyContent: 'center', overflow: 'hidden', padding: '8px 24px 24px' }
            : { padding: '32px 24px 64px' }),
        }}
      >
        {activeTab === 'bucket' && <BucketListPage />}
        {activeTab === 'gallery' && <GalleryPage />}
        {activeTab === 'milestones' && <MilestonesPage />}
        {isUs && <AboutUsPage />}
      </main>
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
