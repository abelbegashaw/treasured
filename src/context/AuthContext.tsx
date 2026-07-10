import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase-client';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (passcode: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore any existing session on load...
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // ...then keep it in sync with sign in / sign out events.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (passcode: string) => {
    // The passcode is verified server-side by the verify-passcode Edge Function,
    // which returns a real Supabase session for the shared account. We never see
    // (or store) the actual account password here — only the passcode goes out.
    const { data, error } = await supabase.functions.invoke('verify-passcode', {
      body: { passcode },
    });

    if (error) {
      // A 401 from the function surfaces here as a FunctionsHttpError; try to
      // read the JSON body for the friendly message, fall back to a default.
      let message = 'Incorrect passcode.';
      const res = (error as { context?: Response }).context;
      if (res && typeof res.json === 'function') {
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // ignore — keep the default message
        }
      }
      throw new Error(message);
    }

    if (!data?.session) throw new Error('Could not sign in.');

    // Installs the session so every later Supabase request is authenticated;
    // this also fires onAuthStateChange, which swaps the login screen for the app.
    const { error: setError } = await supabase.auth.setSession(data.session);
    if (setError) throw setError;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
