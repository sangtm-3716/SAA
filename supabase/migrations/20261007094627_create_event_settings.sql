-- Countdown / Prelaunch page: single-row table holding the event launch instant.
--
-- The spec's intended source for this value is an upstream API endpoint that was
-- never designed (see plans/261007-1617-countdown-prelaunch-page/clarifications.md,
-- decision 1). This table is the agreed stand-in, read server-side only
-- (frontend/lib/event/event-settings.ts) so the launch instant cannot be
-- tampered with client-side and can change without a redeploy.
--
-- Security property: public to READ, impossible to WRITE from any client the
-- browser can reach. RLS is enabled with a select-only policy for anon and
-- authenticated roles; deliberately no insert/update/delete policy — under
-- RLS, absence of a policy is a denial. Only service_role (bypasses RLS) or
-- the dashboard can write.
create table if not exists public.event_settings (
  id         smallint primary key default 1,
  starts_at  timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint event_settings_singleton check (id = 1)
);

alter table public.event_settings enable row level security;

create policy "event_settings_public_read"
  on public.event_settings
  for select
  to anon, authenticated
  using (true);
