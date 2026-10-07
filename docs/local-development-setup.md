# Local development setup — Supabase + Google OAuth

This is the one path from a clean clone to a running local stack with Google sign-in working
against `http://localhost:3000`. Follow the steps in order; each one names the exact failure it
prevents.

## 1. Start the container runtime (colima)

`supabase start` needs a container runtime. On macOS this project uses colima:

```sh
colima start
```

Confirm it is up:

```sh
colima status
```

## 2. Get Google OAuth credentials

In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create
(or reuse) an OAuth 2.0 Client ID of type "Web application", and add this **exact** authorized
redirect URI:

```
http://127.0.0.1:54321/auth/v1/callback
```

This is **GoTrue's own callback** (the local Supabase Auth server), not the Next.js
`/auth/callback` route. Registering the Next.js route here instead is a classic misconfiguration —
Google will reject the hand-off with `redirect_uri_mismatch` before Supabase is ever involved.

Copy the generated **Client ID** and **Client Secret** — you need them in step 4.

## 3. Start the local Supabase stack

From the repo root:

```sh
supabase start
```

This reads `supabase/config.toml` (Google provider already enabled, nonce check already relaxed
for local use — see "Security notes" below) and brings up Postgres, GoTrue, and the other local
services. On success it prints a table including the API URL and the anon key:

```sh
supabase status
```

Keep this output open — you need the `anon key` value in step 5.

## 4. Fill in the root `.env` (Supabase CLI config substitution)

Copy the template and fill in the two Google values from step 2:

```sh
cp .env.example .env
```

Edit `.env` and set:

```dotenv
GOOGLE_CLIENT_ID=<client id from step 2>
GOOGLE_CLIENT_SECRET=<client secret from step 2>
```

The `SUPABASE_*` keys in this file are for a *hosted* project and are unused locally — leave them
as placeholders. `supabase/config.toml` reads `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` via
`env(...)` substitution when `supabase start` runs, so this file must exist before step 3 if you
want the provider populated (re-run `supabase stop && supabase start` after editing `.env` if you
filled it in after already starting the stack).

## 5. Fill in `frontend/.env.local` (the Next.js app)

Copy the template:

```sh
cp frontend/.env.example frontend/.env.local
```

`frontend/.env.local` already ships with the Supabase CLI's well-known default local anon key,
valid as long as `supabase/config.toml` has no custom `[auth.jwt]` secret (it doesn't, in this
repo). Confirm it matches the `anon key` printed by `supabase status` in step 3; if it differs,
replace it.

## 6. Run the app

```sh
cd frontend
npm run dev
```

Visit `http://localhost:3000/login` and click the Google sign-in button.

## 7. Verify without a browser (optional but recommended)

This command proves both the Google provider and the redirect allow-list are correctly configured,
with no browser needed:

```sh
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  "http://127.0.0.1:54321/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback"
```

Expect a **302 redirect to `accounts.google.com`**. A redirect back to `site_url`
(`http://localhost:3000`) carrying an `error=` query parameter means either the redirect URL is not
in `additional_redirect_urls`, or the Google provider credentials are missing/invalid.

## Security notes

- `skip_nonce_check = true` in `supabase/config.toml` relaxes OIDC replay protection and is
  acceptable **only** for this local stack. **Never set this to `true` in a production/hosted
  Supabase project.**
- `GOOGLE_CLIENT_SECRET` lives only in the gitignored root `.env`, read by the Supabase CLI via
  `env()` substitution — it never reaches the browser or the Next.js bundle.
- Only `NEXT_PUBLIC_SUPABASE_URL` and the publishable/anon key are exposed to the frontend. The
  anon key is designed for public exposure; no service-role key is ever introduced to `frontend/`.
- Never commit `.env` or `frontend/.env.local`. Only `*.env.example` files are tracked in git.
