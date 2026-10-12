# Local development setup

The path from a clean clone to a running app. Follow the steps in order; each one names the
exact failure it prevents.

Google sign-in is **not** on this path any more — see [Optional: Google OAuth](#optional-google-oauth)
at the end for why, and for how to set it up if you do want it.

---

## 1. Start the container runtime (colima)

This machine has **no Docker Desktop**. The Docker daemon comes from
[colima](https://github.com/abiosoft/colima), and `supabase start` cannot work without it.

```sh
colima status                                  # "colima is not running" => start it
colima start --cpu 4 --memory 8 --disk 60      # first boot ~45s; idempotent afterwards
docker info --format '{{.ServerVersion}}'      # sanity check: the daemon answers
```

4 CPU / 8 GB is the **floor** for the Supabase stack (12 containers). The colima defaults
(2 CPU / 2 GB) make Postgres and the auth container flap.

A `failed to connect to the docker API at unix://.../docker.sock` error means colima is down,
**not** that Docker is broken. Start colima; do not reinstall anything.

> A `watchlist-postgres` container from an unrelated project auto-starts with the VM. It is not
> part of this repo — leave it alone.

---

## 2. Start the local Supabase stack

From the repo root:

```sh
supabase start     # applies supabase/migrations/ then supabase/seeds/common/
supabase status    # prints the URLs and keys you need in step 3
```

On a fresh volume this applies all migrations and seeds in order:

| Migrations | |
|---|---|
| `20261007094627_create_event_settings` | the countdown instant (see step 4) |
| `20261012034500_create_kudos_board` | Sunners, posts, reactions, the feed views |
| `20261012060000_kudos_featured_sunners` | `is_featured`, so the spotlight cloud excludes the reactor pool |
| `20261012080000_kudos_compose` | compose RPC, award titles, anonymous sending, image bucket |
| `20261012090000_kudos_reaction_toggle` | the heart toggle RPC |

| Seeds | |
|---|---|
| `01_event_settings` | the launch instant |
| `02_kudos` | 8 Figma Sunners, a reactor pool, 388 posts |
| `03_kudos_compose` | award titles and hashtags for the compose dropdowns |

---

## 3. Point the app at Supabase

```sh
cp frontend/.env.example frontend/.env.local
```

Set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the `PUBLISHABLE_KEY` value printed by
`supabase status`.

Two things that cost real time if missed:

- **The keys rotate whenever the stack is recreated.** Re-read `supabase status` and update
  `.env.local` after any `supabase stop && supabase start` that rebuilds containers.
- **This CLI issues new-style `sb_publishable_...` keys.** The legacy demo JWT anon key that
  older Supabase guides hand out returns `401 None of the keys was able to decode the JWT`.

---

## 4. Unlock the countdown — read this before you think the app is broken

`frontend/lib/supabase/middleware.ts` redirects **every** route to `/countdown` while
`public.event_settings.starts_at` is in the future. The seed sets it to **2026-12-01 09:00+07**,
so immediately after `supabase start` or `supabase db reset`, `/`, `/kudos`, `/login` and
`/todo` all `307 -> /countdown`. Nothing is wrong; the site is deliberately locked.

To work on anything other than the countdown, push the instant into the past:

```sh
docker exec supabase_db_agentic-coding-live-demo \
  psql -U postgres -d postgres \
  -c "update public.event_settings set starts_at = now() - interval '1 day' where id = 1;"
```

`frontend/lib/event/event-settings.ts` caches the value in-process for **60 seconds**, so allow up
to a minute (or restart the dev server) before the change takes effect.

`EVENT_STARTS_AT` in `frontend/.env.local` overrides the table read entirely. It is **server-only** —
never prefix it with `NEXT_PUBLIC_`, or the override reaches the browser bundle. This is the knob
the E2E harness uses to drive the lock (see step 7).

The lock **fails open**: an unset value, an unreachable database, or any read failure all mean
UNLOCKED, never locked.

---

## 5. Run the app

```sh
cd frontend
npm install
npm run dev
```

`http://localhost:3000` — the SAA homepage. `http://localhost:3000/kudos` — the live board.

> `next dev` refuses to start a second instance sharing `.next`. If you need a second server, set
> `NEXT_DIST_DIR` (which `next.config.ts` honours for exactly this reason).

---

## 6. Which Supabase command to reach for

| Command | Effect |
|---|---|
| `supabase migration up` | Applies only migrations not yet applied. **Keeps all data.** Use this after pulling a new migration. |
| `supabase db reset` | Drops, re-migrates, re-seeds. **Destroys every Kudo posted through the app** and re-locks the countdown (step 4). |
| `supabase stop` | Stops the stack, keeps volumes. |
| `supabase start` | Brings it back. |

`colima delete` wipes every volume on the VM, including the Supabase database. Avoid it unless a
full reset is intended.

### Querying the database

There is no host `psql` client. Go through the container:

```sh
docker exec supabase_db_agentic-coding-live-demo psql -U postgres -d postgres -c '<SQL>'
```

---

## 7. Tests

```sh
cd frontend
npx playwright test --project=unit   # pure-function tests, no browser, ~3s
npm run test:e2e                     # full Playwright suite
```

The E2E suite starts **two** dev servers, because some tests need the countdown lock ACTIVE and
the rest need it INACTIVE:

- `:3000` — `EVENT_STARTS_AT` unset, lock inactive. Runs everything except `@locked`.
- `:3001` — `EVENT_STARTS_AT` far future, lock active. Runs only the `@locked` tests.

They use separate build directories via `NEXT_DIST_DIR`; see the comment at the top of
`playwright.config.ts`. First run on a new machine may need `npx playwright install chromium`.

---

## Why sign-in is not required

The Kudos feature does **not** use authentication. Sign-in does not work in this deployment and is
not expected to, so the current user is mocked: `frontend/lib/kudos/current-sunner.ts` resolves
"you" to the seeded Sunner behind `DEMO_SUNNER_CODE` (`CEVC10`), the same stand-in the board's
right rail has always used.

Consequences, stated plainly:

- `/kudos/compose` is open to anonymous visitors — no redirect to `/login`.
- `create_kudos_post` and `toggle_kudos_reaction` take the sender as a **parameter**, so anyone who
  can reach the database can post or heart as that Sunner. Acceptable for a demo with no real
  accounts; not a model to carry into anything real.
- `/todo` is still gated by a real session, so it remains unreachable without sign-in.

Full detail, including exactly what to change if sign-in ever lands, is in
`plans/261012-1432-kudos-compose-screen/functionality-notes.md`.

---

## Optional: Google OAuth

Only needed if you want `/login` and `/todo` to work. Nothing on the Kudos path depends on it.

### Credentials

In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create
(or reuse) an OAuth 2.0 Client ID of type "Web application", and add this **exact** authorized
redirect URI:

```
http://127.0.0.1:54321/auth/v1/callback
```

This is **GoTrue's own callback** (the local Supabase Auth server), not the Next.js
`/auth/callback` route. Registering the Next.js route here instead is the classic
misconfiguration — Google rejects the hand-off with `redirect_uri_mismatch` before Supabase is
ever involved.

### Wire them in

```sh
cp .env.example .env    # repo root, gitignored
```

```dotenv
GOOGLE_CLIENT_ID=<client id>
GOOGLE_CLIENT_SECRET=<client secret>
```

`supabase/config.toml` reads these via `env(...)` substitution **when `supabase start` runs**, so
the file must exist before step 2. If you filled it in afterwards, run
`supabase stop && supabase start`.

The `SUPABASE_*` keys in the root `.env` are for a *hosted* project and are unused locally — leave
them as placeholders.

### Verify without a browser

```sh
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  "http://127.0.0.1:54321/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback"
```

Expect a **302 to `accounts.google.com`**. A redirect back to `site_url`
(`http://localhost:3000`) carrying an `error=` parameter means either the redirect URL is missing
from `additional_redirect_urls`, or the provider credentials are missing/invalid.

---

## Security notes

- `skip_nonce_check = true` in `supabase/config.toml` relaxes OIDC replay protection and is
  acceptable **only** for this local stack. **Never set this to `true` in a hosted project.**
- `GOOGLE_CLIENT_SECRET` lives only in the gitignored root `.env`, read by the Supabase CLI via
  `env()` substitution — it never reaches the browser or the Next.js bundle.
- Only `NEXT_PUBLIC_SUPABASE_URL` and the publishable key are exposed to the frontend. The
  publishable key is designed for public exposure; no service-role key is ever introduced to
  `frontend/`.
- `EVENT_STARTS_AT` is server-only by design. Prefixing it with `NEXT_PUBLIC_` would leak the
  launch instant into the browser bundle.
- Never commit `.env` or `frontend/.env.local`. Only `*.env.example` files are tracked.
