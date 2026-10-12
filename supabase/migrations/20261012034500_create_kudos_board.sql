-- Sun* Kudos live board — MoMorph screen MaZUn5xHXZ ("Sun* Kudos - Live board").
--
-- Security posture is inherited verbatim from 20261007094627_create_event_settings:
-- every table is PUBLIC TO READ and IMPOSSIBLE TO WRITE from any client the
-- browser can reach. RLS is enabled everywhere with a select-only policy for
-- anon + authenticated, and deliberately NO insert/update/delete policy — under
-- RLS, the absence of a policy is a denial. Only service_role (which bypasses
-- RLS) or the dashboard can write.
--
-- `kudos_reactions` is the one table a later "let people press the heart"
-- phase will need a write policy on. It is intentionally omitted here: an
-- insert policy open to anon would let anybody inflate the heart counts the
-- board displays, and the board currently only reads them.

-- ---------------------------------------------------------------- taxonomy

create table if not exists public.departments (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.hashtags (
  id         uuid primary key default gen_random_uuid(),
  label      text not null unique,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ people

-- `auth_user_id` is nullable because the board is seeded with demo Sunners who
-- have no Supabase auth account. It is UNIQUE so one auth user can never be
-- linked to two Sunner rows.
create table if not exists public.sunners (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users (id) on delete set null,
  full_name     text not null,
  employee_code text not null unique,
  department_id uuid references public.departments (id) on delete set null,
  avatar_url    text,
  badge         text not null default 'new-hero',
  created_at    timestamptz not null default now(),
  -- The three badge artworks the design ships: badge-new-hero.png,
  -- badge-rising-hero.png, badge-legend-hero.png.
  constraint sunners_badge_valid
    check (badge in ('new-hero', 'rising-hero', 'legend-hero'))
);

create index if not exists sunners_department_idx on public.sunners (department_id);

-- ------------------------------------------------------------------- kudos

create table if not exists public.kudos_posts (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.sunners (id) on delete cascade,
  recipient_id uuid not null references public.sunners (id) on delete cascade,
  -- mm:I3127:21871;2234:33039 — the short all-caps line above the message
  -- ("IDOL GIỚI TRẺ"). Optional: not every post in the design carries one.
  title        text,
  message      text not null,
  -- Drives the HIGHLIGHT KUDOS carousel (mm:2940:13451) vs the ALL KUDOS
  -- feed (mm:2940:13475). A post can appear in both.
  is_highlight boolean not null default false,
  created_at   timestamptz not null default now(),
  constraint kudos_posts_no_self check (sender_id <> recipient_id)
);

create index if not exists kudos_posts_created_at_idx
  on public.kudos_posts (created_at desc);
create index if not exists kudos_posts_recipient_idx
  on public.kudos_posts (recipient_id);
create index if not exists kudos_posts_sender_idx
  on public.kudos_posts (sender_id);
-- Partial: the carousel only ever asks for the highlighted handful.
create index if not exists kudos_posts_highlight_idx
  on public.kudos_posts (created_at desc) where is_highlight;

create table if not exists public.kudos_post_images (
  id       uuid primary key default gen_random_uuid(),
  post_id  uuid not null references public.kudos_posts (id) on delete cascade,
  url      text not null,
  position smallint not null default 0,
  unique (post_id, position)
);

create table if not exists public.kudos_post_hashtags (
  post_id    uuid not null references public.kudos_posts (id) on delete cascade,
  hashtag_id uuid not null references public.hashtags (id) on delete cascade,
  primary key (post_id, hashtag_id)
);

create index if not exists kudos_post_hashtags_hashtag_idx
  on public.kudos_post_hashtags (hashtag_id);

-- The heart count the card shows (mm:I3127:21871;256:5174) is `count(*)` over
-- this table, never a denormalised integer on kudos_posts — a counter column
-- can drift from the rows it claims to summarise, and this one cannot.
create table if not exists public.kudos_reactions (
  post_id    uuid not null references public.kudos_posts (id) on delete cascade,
  sunner_id  uuid not null references public.sunners (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, sunner_id)
);

-- -------------------------------------------------------- rewards / prizes

-- mm:2940:13495 / mm:2940:13496 — "Số Secret Box bạn đã mở" vs "chưa mở".
-- `opened_at is null` IS the unopened state; no separate boolean to contradict.
create table if not exists public.secret_boxes (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.sunners (id) on delete cascade,
  reward_label text,
  opened_at    timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists secret_boxes_owner_idx on public.secret_boxes (owner_id);

-- mm:2940:13510 — "10 SUNNER NHẬN QUÀ MỚI NHẤT".
create table if not exists public.gift_claims (
  id           uuid primary key default gen_random_uuid(),
  sunner_id    uuid not null references public.sunners (id) on delete cascade,
  reward_label text not null,
  claimed_at   timestamptz not null default now()
);

create index if not exists gift_claims_claimed_at_idx
  on public.gift_claims (claimed_at desc);

-- ------------------------------------------------------------------- views
--
-- `security_invoker = on` so the querying role's RLS applies. Without it a
-- view runs as its owner and would quietly hand anon a read path around the
-- policies above — the classic way RLS is defeated by accident.

-- One row per post, with both parties, the heart count, the image array and
-- the hashtag arrays already assembled. Keeps the N+1 out of the data layer.
create or replace view public.kudos_post_feed
with (security_invoker = on) as
select
  p.id,
  p.title,
  p.message,
  p.is_highlight,
  p.created_at,
  s.id            as sender_id,
  s.full_name     as sender_name,
  s.employee_code as sender_code,
  s.avatar_url    as sender_avatar,
  s.badge         as sender_badge,
  r.id            as recipient_id,
  r.full_name     as recipient_name,
  r.employee_code as recipient_code,
  r.avatar_url    as recipient_avatar,
  r.badge         as recipient_badge,
  rd.slug         as recipient_department_slug,
  coalesce(hearts.total, 0)         as hearts,
  coalesce(img.urls, '{}'::text[])  as image_urls,
  coalesce(tags.labels, '{}'::text[]) as hashtags,
  coalesce(tags.slugs, '{}'::text[])  as hashtag_slugs
from public.kudos_posts p
join public.sunners s on s.id = p.sender_id
join public.sunners r on r.id = p.recipient_id
left join public.departments rd on rd.id = r.department_id
left join lateral (
  select count(*)::int as total
  from public.kudos_reactions k
  where k.post_id = p.id
) hearts on true
left join lateral (
  select array_agg(i.url order by i.position) as urls
  from public.kudos_post_images i
  where i.post_id = p.id
) img on true
left join lateral (
  select
    array_agg(h.label order by h.label) as labels,
    array_agg(h.slug  order by h.label) as slugs
  from public.kudos_post_hashtags ph
  join public.hashtags h on h.id = ph.hashtag_id
  where ph.post_id = p.id
) tags on true;

-- mm:2940:14174 — the name cloud. `received_count` scales each name's type
-- size, so Sunners with no kudos yet still appear (left join), just small.
create or replace view public.kudos_spotlight_names
with (security_invoker = on) as
select
  s.id,
  s.full_name,
  s.employee_code,
  count(p.id)::int as received_count
from public.sunners s
left join public.kudos_posts p on p.recipient_id = s.id
group by s.id, s.full_name, s.employee_code;

-- mm:3004:15995..15999 — the ticker. Returns the instant and the recipient
-- only; the Vietnamese sentence around them is built in the app so it stays
-- translatable, rather than being frozen into the database.
create or replace view public.kudos_activity_feed
with (security_invoker = on) as
select
  p.id,
  p.created_at as at,
  r.full_name  as recipient_name
from public.kudos_posts p
join public.sunners r on r.id = p.recipient_id
order by p.created_at desc
limit 50;

-- --------------------------------------------------------------------- RLS

alter table public.departments         enable row level security;
alter table public.hashtags            enable row level security;
alter table public.sunners             enable row level security;
alter table public.kudos_posts         enable row level security;
alter table public.kudos_post_images   enable row level security;
alter table public.kudos_post_hashtags enable row level security;
alter table public.kudos_reactions     enable row level security;
alter table public.secret_boxes        enable row level security;
alter table public.gift_claims         enable row level security;

create policy "departments_public_read"         on public.departments         for select to anon, authenticated using (true);
create policy "hashtags_public_read"            on public.hashtags            for select to anon, authenticated using (true);
create policy "sunners_public_read"             on public.sunners             for select to anon, authenticated using (true);
create policy "kudos_posts_public_read"         on public.kudos_posts         for select to anon, authenticated using (true);
create policy "kudos_post_images_public_read"   on public.kudos_post_images   for select to anon, authenticated using (true);
create policy "kudos_post_hashtags_public_read" on public.kudos_post_hashtags for select to anon, authenticated using (true);
create policy "kudos_reactions_public_read"     on public.kudos_reactions     for select to anon, authenticated using (true);
create policy "secret_boxes_public_read"        on public.secret_boxes        for select to anon, authenticated using (true);
create policy "gift_claims_public_read"         on public.gift_claims         for select to anon, authenticated using (true);

grant select on public.kudos_post_feed       to anon, authenticated;
grant select on public.kudos_spotlight_names to anon, authenticated;
grant select on public.kudos_activity_feed   to anon, authenticated;
