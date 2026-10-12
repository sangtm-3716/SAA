-- "Highlight Kudos = the 5 Kudos with the most hearts" needs heart counts that
-- actually spread. One heart per Sunner per post is the right model (the
-- composite PK on kudos_reactions is what stops vote-stuffing), but with only
-- the 8 Sunners the Figma screen names, every post landed on 5 or 6 hearts and
-- 130 of them tied at the top — a ranking in name only.
--
-- Rather than weaken the reaction model, the seed now also creates a pool of
-- reactor-only Sunners. They are never rendered: they send nothing, receive
-- nothing, claim no gifts, and this flag keeps them out of the spotlight
-- cloud, which the design draws from exactly those 8 named people.
--
-- Defaults to TRUE so the eight already-seeded Sunners stay featured.
alter table public.sunners
  add column if not exists is_featured boolean not null default true;

create index if not exists sunners_featured_idx
  on public.sunners (is_featured) where is_featured;

-- The cloud shows only the featured Sunners. Recreated rather than altered:
-- Postgres cannot add a WHERE clause to an existing view in place.
drop view if exists public.kudos_spotlight_names;

create view public.kudos_spotlight_names
with (security_invoker = on) as
select
  s.id,
  s.full_name,
  s.employee_code,
  count(p.id)::int as received_count
from public.sunners s
left join public.kudos_posts p on p.recipient_id = s.id
where s.is_featured
group by s.id, s.full_name, s.employee_code;

grant select on public.kudos_spotlight_names to anon, authenticated;
