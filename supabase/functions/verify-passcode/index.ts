// @ts-nocheck — this file runs on Deno (Supabase Edge runtime), not through the
// app's Node/Vite TypeScript build. The local TS server doesn't know the `Deno`
// global or `jsr:`/import-map specifiers, so it reports false errors here. The
// code is valid on Deno; this directive silences the editor noise.
//
// Edge Function: verify-passcode
//
// Verifies the shared passcode ON THE SERVER, then logs into a single hidden
// shared account whose real credentials live only in this function's secrets.
// The browser only ever sends the passcode and receives back a normal Supabase
// session — it never sees the real password or the passcode secret.
//
// Required secrets (set with `supabase secrets set ...`):
//   APP_PASSCODE     — the shared passcode the two users type in
//   SHARED_EMAIL     — email of the hidden shared Supabase auth account
//   SHARED_PASSWORD  — password of that hidden account
// SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically by Supabase.

import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

// Constant-time string comparison so we don't leak the passcode via timing.
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Always compare over a fixed length to avoid leaking length differences.
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const expectedPasscode = Deno.env.get('APP_PASSCODE');
  const sharedEmail = Deno.env.get('SHARED_EMAIL');
  const sharedPassword = Deno.env.get('SHARED_PASSWORD');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!expectedPasscode || !sharedEmail || !sharedPassword || !supabaseUrl || !anonKey) {
    // Misconfiguration — don't reveal which secret is missing.
    return json({ error: 'Server is not configured.' }, 500);
  }

  let passcode: unknown;
  try {
    ({ passcode } = await req.json());
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  if (typeof passcode !== 'string' || !timingSafeEqual(passcode, expectedPasscode)) {
    // Generic message on purpose — no hint about why it failed.
    return json({ error: 'Incorrect passcode.' }, 401);
  }

  // Passcode is correct: sign into the hidden shared account and hand the
  // resulting session back to the browser.
  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: sharedEmail,
    password: sharedPassword,
  });

  if (error || !data.session) {
    return json({ error: 'Could not establish a session.' }, 500);
  }

  return json({ session: data.session }, 200);
});
