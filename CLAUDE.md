# CLAUDE.md

Project-specific operating instructions. See also `docs/local-development-setup.md`
and `.claude/rules/` for the general development rules.

## Container runtime — ALWAYS use Colima

This machine has **no Docker Desktop**. The Docker daemon is provided by
[Colima](https://github.com/abiosoft/colima). Nothing that needs Docker —
`supabase start` above all — will work until Colima is running.

Before any Docker/Supabase work, check and start it:

```bash
colima status                                  # "colima is not running" => start it
colima start --cpu 4 --memory 8 --disk 60      # first boot ~45s; idempotent afterwards
docker info --format '{{.ServerVersion}}'      # sanity check the daemon answers
```

The socket lives at `unix:///Users/$USER/.colima/default/docker.sock`. A
`failed to connect to the docker API at unix://.../docker.sock` error means
Colima is down, **not** that Docker is broken — start Colima, do not reinstall
anything.

`colima stop` to release the VM's RAM. `colima delete` wipes every volume on it,
including the Supabase database — avoid it unless a full reset is intended.

### Resource sizing

4 CPU / 8 GB is the floor for the Supabase stack (12 containers). The defaults
(2 CPU / 2 GB) make Postgres and the auth container flap.

### docker compose

Use `docker compose` (v2 subcommand), not the legacy `docker-compose` binary.
This repo currently ships **no compose file** — the only stack is Supabase's,
managed by the Supabase CLI, which writes its own compose definitions into
`supabase/.temp/`. Do not hand-edit those. If a compose file is ever added,
`docker compose up -d` still requires Colima to be running first.

### Unrelated containers

A `watchlist-postgres` container (`postgres:17`, `restart=unless-stopped`) from
another project auto-starts with the VM. It is **not** part of this repo — leave
it alone.

## Local Supabase

```bash
supabase start     # needs Colima up; applies supabase/migrations/ + supabase/seeds/common/
supabase status    # prints URLs and keys
supabase stop      # keeps volumes
supabase db reset  # drops, re-migrates, re-seeds
```

Keys rotate whenever the stack is recreated. This CLI issues new-style
`sb_publishable_...` keys — the legacy demo JWT anon key returns
`401 None of the keys was able to decode the JWT`. Re-read `supabase status`
and update `frontend/.env.local` after any recreate.

Postgres has no host `psql` client. Query through the container:

```bash
docker exec supabase_db_agentic-coding-live-demo psql -U postgres -d postgres -c '<SQL>'
```

## The countdown navigation lock — read before running the app

`frontend/lib/supabase/middleware.ts` redirects **every** route to `/countdown`
while `public.event_settings.starts_at` is in the future. The seed sets it to
`2026-12-01 09:00+07`, so with Supabase running, `/`, `/login` and `/todo` all
`307 -> /countdown`, and the login E2E suite goes red.

To work on anything other than the countdown, push the instant into the past:

```bash
docker exec supabase_db_agentic-coding-live-demo \
  psql -U postgres -d postgres \
  -c "update public.event_settings set starts_at = now() - interval '1 day' where id = 1;"
```

The in-process cache in `frontend/lib/event/event-settings.ts` has a 60s TTL, so
allow up to a minute (or restart the dev server) for the change to take effect.

`EVENT_STARTS_AT` in `frontend/.env.local` overrides the table read and is
**server-only** — never prefix it with `NEXT_PUBLIC_`.
