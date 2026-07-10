import { useState, type FormEvent } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { AmbientBackground } from '../layout/AmbientBackground';

// Auth gate: a single shared passcode, verified server-side, unlocks the app.
export function LoginPage() {
  const theme = useTheme();
  const { signIn } = useAuth();

  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await signIn(passcode);
      // On success the AuthProvider's listener swaps this screen for the app.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', backgroundColor: theme.canvas, color: theme.ink, fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <GlobalStyles />
      <AmbientBackground />

      <section className="reveal-up" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '380px', backgroundColor: theme.card, border: `1px solid ${theme.ink}`, borderRadius: 0, padding: '36px 32px' }}>
        <p style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.32em', color: theme.muted }}>List&nbsp;/&nbsp;Two</p>
        <h1 style={{ marginTop: '14px', marginBottom: '4px', fontSize: '28px', fontWeight: 400, color: theme.ink }}>Welcome back</h1>
        <p style={{ marginTop: 0, marginBottom: '26px', fontSize: '15px', color: theme.muted }}>Enter your shared passcode to continue.</p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPasscode ? 'text' : 'password'}
              placeholder="Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="pill-input"
              style={{ paddingRight: '50px', width: '100%' }}
              autoComplete="off"
              autoFocus
              required
            />
            <button
              type="button"
              onClick={() => setShowPasscode((v) => !v)}
              aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
              aria-pressed={showPasscode}
              className="passcode-eye"
            >
              {showPasscode ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {error && (
            <p style={{ margin: '4px 4px 0', fontSize: '13px', color: theme.rose }}>{error}</p>
          )}

          <button type="submit" className="pill-btn pill-btn-primary" disabled={submitting} style={{ marginTop: '4px', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </div>
  );
}

// Feather-style eye icons for the passcode reveal toggle.
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
