// @ts-nocheck — runs on Deno (Supabase Edge runtime), not the app's TS build.
//
// Edge Function: delete-image
//
// Deletes an asset from Cloudinary. This MUST be server-side: destroying an
// asset requires a signed request using the Cloudinary API secret, which can
// never be shipped to the browser. The client sends only the public_id.
//
// Required secrets (set with `supabase secrets set ...`):
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET

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

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
  const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
  const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');
  if (!cloudName || !apiKey || !apiSecret) {
    return json({ error: 'Server is not configured.' }, 500);
  }

  let publicId: unknown;
  try {
    ({ publicId } = await req.json());
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  if (typeof publicId !== 'string' || !publicId) {
    return json({ error: 'Missing publicId.' }, 400);
  }

  // Cloudinary signature: sha1 of the sorted, signable params + api_secret.
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await sha1Hex(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`);

  const form = new FormData();
  form.append('public_id', publicId);
  form.append('timestamp', String(timestamp));
  form.append('api_key', apiKey);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return json({ error: data?.error?.message || 'Cloudinary destroy failed.' }, 502);
  }
  // result is 'ok' (deleted) or 'not found' (already gone) — both are fine.
  return json({ result: data.result ?? 'ok' }, 200);
});
