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
import { AboutUsPage } from './components/about/AboutUsPage';
import type { Tab } from './types';

function AppShell() {
  const theme = useTheme();

  // --- COMPONENT VIEWS CONTROL STATE ---
  const [activeTab, setActiveTab] = useState<Tab>('bucket');

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', backgroundColor: theme.canvas, color: theme.ink, fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
      <GlobalStyles />
      <AmbientBackground />
      <Header activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* --- WORKSPACE LAYOUT PANELS --- */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '760px', margin: '0 auto', padding: '32px 24px 64px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeTab === 'bucket' && <BucketListPage />}
        {activeTab === 'gallery' && <GalleryPage />}
        {activeTab === 'us' && <AboutUsPage />}
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
