-- Default launch instant for the countdown / prelaunch page. Expressed with
-- an explicit +07 (Asia/Ho_Chi_Minh) offset so the UTC+7 intent is readable
-- in the SQL itself; the column is timestamptz, so the stored value is an
-- absolute instant.
--
-- `on conflict do nothing` keeps this idempotent across repeated
-- `supabase db reset` runs — the row is seeded once and never overwritten.
insert into public.event_settings (id, starts_at)
values (1, '2026-12-01 09:00:00+07')
on conflict (id) do nothing;
