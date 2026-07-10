# Supabase setup — passcode auth

The app is gated by a single **shared passcode**, verified server-side by the
`verify-passcode` Edge Function. On a correct passcode the function signs into one
hidden shared account and returns a normal Supabase session to the browser. RLS
(`rls.sql`) then only serves data to that authenticated session.

Nobody ever sees the real account password or the passcode secret — they live only
in the Edge Function's secrets.

## One-time setup

You need the [Supabase CLI](https://supabase.com/docs/guides/cli) installed. Steps 2–6
require being logged into your own Supabase account, so run them yourself. In this chat
you can prefix a command with `!` to run it and share the output.

### 1. Create the hidden shared account
Dashboard → **Authentication → Users → Add user**:
- Email: e.g. `shared@listfortwo.internal` (it never receives mail; any address works)
- Password: a long random string (you won't type this again — the function uses it)
- Leave "Auto Confirm User" **on** so the account can sign in immediately.

### 2. Log in and link the CLI
```bash
supabase login
supabase link --project-ref djqycttwlbowahjbfgnn
```
(`djqycttwlbowahjbfgnn` is this project's ref, from `src/supabase-client.ts`.)

### 3. Set the function secrets
Replace the values with your real passcode and the account from step 1:
```bash
supabase secrets set \
  APP_PASSCODE="your-shared-passcode" \
  SHARED_EMAIL="shared@listfortwo.internal" \
  SHARED_PASSWORD="the-long-random-password"
```
(`SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided to the function automatically —
don't set them.)

### 4. Deploy the function
```bash
supabase functions deploy verify-passcode
```

### 5. Apply Row Level Security
Dashboard → **SQL Editor** → paste the contents of [`rls.sql`](./rls.sql) → **Run**.

### 6. Test
```bash
npm run dev
```
Wrong passcode → rejected. Correct passcode → app loads and your lists/gallery fetch.

## Changing the passcode later
Just re-run step 3 with a new `APP_PASSCODE` (no redeploy needed) — secrets update live.

---

# Photo deletion — `delete-image` function

When you Remove a photo, the app deletes the Supabase row itself, then calls this
function to also delete the file from Cloudinary. Cloudinary deletion must be
server-side (it needs the API secret, which can never be in the browser).

## Setup (dashboard, same flow as verify-passcode)

### 1. Create the function
Edge Functions → Create a function → name it `delete-image` → paste the contents
of `supabase/functions/delete-image/index.ts` → Deploy.

### 2. Add the Cloudinary secrets
Edge Functions → Secrets. Grab these from your Cloudinary dashboard
(**Settings → API Keys**, and the cloud name is on the main dashboard):
```
CLOUDINARY_CLOUD_NAME   = your cloud name (same value as VITE_CLOUDINARY_CLOUD_NAME)
CLOUDINARY_API_KEY      = your Cloudinary API key
CLOUDINARY_API_SECRET   = your Cloudinary API secret   (server-only — never VITE_)
```

### 3. Test
Open a photo → Remove → confirm. The row disappears and the asset is gone from
your Cloudinary Media Library. If the secrets are missing you'll see "Photo
removed, but its stored file could not be deleted." (the row still deletes).
