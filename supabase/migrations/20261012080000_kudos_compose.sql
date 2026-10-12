-- Compose a Kudo — MoMorph screen ihQ26W78P2 ("Viết Kudo").
--
-- 20261012034500 built the board as strictly read-only: every table public to
-- read, no insert policy anywhere, writes reserved for service_role. This
-- migration opens exactly ONE write path and keeps that posture otherwise —
-- `public.create_kudos_post`, a security-definer RPC that validates everything
-- before it inserts. No table gains an insert policy, so a client holding the
-- publishable key still cannot write a row directly; it can only ask this
-- function to.
--
-- Four things land here:
--   1. `is_anonymous` on kudos_posts, and the read-path changes that make it
--      MEAN something rather than being a flag the API cheerfully ignores.
--   2. `kudos_award_titles` — the suggestion list behind the "Danh hiệu" field.
--   3. The `kudos-images` storage bucket for the five attachments.
--
-- NO AUTHENTICATION. Sign-in does not work in this deployment and is not
-- expected to, so the compose form posts as a MOCKED current user and the RPC
-- takes its sender as a parameter. The consequence is blunt and deliberate:
-- anyone who can reach the database can post a Kudo as anyone. That is
-- acceptable only because this is a demo with no real accounts behind it. If
-- sign-in ever lands, the fix is to resolve the sender from `auth.uid()`
-- again and to re-scope the storage policies to `authenticated`.

-- ------------------------------------------------------------------ helpers

-- Hashtags are user-entered and often Vietnamese ("Tận tâm"), so the slug has
-- to survive diacritics. Without unaccent every accented label collapses to
-- the same string of hyphens and distinct tags collide on the UNIQUE slug.
create extension if not exists unaccent with schema extensions;

create or replace function public.kudos_slugify(p_value text)
returns text
language sql
stable
set search_path = public, extensions
as $$
  select coalesce(
    nullif(
      btrim(
        regexp_replace(
          lower(extensions.unaccent(coalesce(p_value, ''))),
          '[^a-z0-9]+', '-', 'g'
        ),
        '-'
      ),
      ''
    ),
    -- A label made entirely of punctuation/emoji still needs a stable, unique
    -- slug rather than an empty string that would collide with the next one.
    'tag-' || substr(md5(coalesce(p_value, '')), 1, 8)
  );
$$;

-- ------------------------------------------------------------- anonymous send

-- mm:I520:11647;520:14099 (mms_G_Gửi ẩn danh)
alter table public.kudos_posts
  add column if not exists is_anonymous boolean not null default false;

-- ------------------------------------------------------- award title catalogue

-- mm:I520:11647;1688:10437 — the "Danh hiệu" field is a free-text box WITH a
-- dropdown caret, and its own helper text reads "Ví dụ: Người truyền động lực
-- cho tôi." So this is a suggestion list, not a closed vocabulary: the RPC
-- accepts any title and never checks it against this table. The table exists
-- only to give the dropdown something to offer.
create table if not exists public.kudos_award_titles (
  id         uuid primary key default gen_random_uuid(),
  label      text not null unique,
  position   smallint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists kudos_award_titles_position_idx
  on public.kudos_award_titles (position, label);

alter table public.kudos_award_titles enable row level security;

drop policy if exists "kudos_award_titles_public_read" on public.kudos_award_titles;
create policy "kudos_award_titles_public_read"
  on public.kudos_award_titles for select to anon, authenticated using (true);

-- ------------------------------------------------------- hiding the sender

-- `is_anonymous` is only a privacy control if the sender is genuinely
-- unreachable. `kudos_posts_public_read` grants anon SELECT on every column,
-- so a masked view alone would leave `sender_id` one REST call away and the
-- checkbox would be theatre.
--
-- Table-level SELECT implies every column and cannot be narrowed by revoking
-- one, so the grant is replaced with a column list that simply omits
-- `sender_id`. The row policy is untouched — this is privilege, not RLS.
revoke select on public.kudos_posts from anon, authenticated;
grant select (id, recipient_id, title, message, is_highlight, is_anonymous, created_at)
  on public.kudos_posts to anon, authenticated;

-- `lib/kudos/rail-queries.ts` counts "Kudos you sent" with a WHERE on
-- sender_id, which the revoke above now blocks (a predicate needs the column
-- privilege too). It moves behind this function, which answers a COUNT and
-- never the identities behind it.
create or replace function public.kudos_sent_count(p_sunner_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.kudos_posts where sender_id = p_sunner_id;
$$;

grant execute on function public.kudos_sent_count(uuid) to anon, authenticated;

-- The feed view joins through `p.sender_id`, so under `security_invoker = on`
-- it would now fail for exactly the roles that need it. It becomes the single
-- controlled read path instead: a definer view whose select list is fixed and
-- takes no caller input, and which nulls every sender column when the post is
-- anonymous. This is a deliberate reversal of the `security_invoker` note in
-- 20261012034500 — that comment guards against a definer view handing anon a
-- way AROUND the policies; here the view is the mechanism that enforces one.
drop view if exists public.kudos_post_feed;

create view public.kudos_post_feed
with (security_invoker = off) as
select
  p.id,
  p.title,
  p.message,
  p.is_highlight,
  p.is_anonymous,
  p.created_at,
  case when p.is_anonymous then null else s.id            end as sender_id,
  case when p.is_anonymous then null else s.full_name     end as sender_name,
  case when p.is_anonymous then null else s.employee_code end as sender_code,
  case when p.is_anonymous then null else s.avatar_url    end as sender_avatar,
  case when p.is_anonymous then null else s.badge         end as sender_badge,
  r.id            as recipient_id,
  r.full_name     as recipient_name,
  r.employee_code as recipient_code,
  r.avatar_url    as recipient_avatar,
  r.badge         as recipient_badge,
  rd.slug         as recipient_department_slug,
  coalesce(hearts.total, 0)           as hearts,
  coalesce(img.urls, '{}'::text[])    as image_urls,
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

grant select on public.kudos_post_feed to anon, authenticated;

-- ---------------------------------------------------------------- write path

-- The one way a browser client can create a Kudo.
--
-- `p_sender_id` is a PARAMETER because there is no session to read an identity
-- from — see the header note. With auth, this would come from `auth.uid()` and
-- the caller would have no say in it.
--
-- Everything else is still validated here rather than trusted from the form,
-- because the form is not the only thing that can call this. Each failure
-- raises a distinct message so the action layer can map it to a translated
-- field error.
create or replace function public.create_kudos_post(
  p_sender_id    uuid,
  p_recipient_id uuid,
  p_title        text,
  p_message      text,
  p_hashtags     text[] default '{}',
  p_image_urls   text[] default '{}',
  p_is_anonymous boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_id  uuid := p_sender_id;
  v_post_id    uuid;
  v_tags       text[];
  v_images     text[];
  v_label      text;
  v_slug       text;
  v_hashtag_id uuid;
  v_title      text := btrim(coalesce(p_title, ''));
  v_message    text := btrim(coalesce(p_message, ''));
  i            int;
begin
  -- The mocked current user still has to BE someone: a Kudo from a Sunner who
  -- does not exist would break every join the board makes.
  if v_sender_id is null
     or not exists (select 1 from public.sunners where id = v_sender_id) then
    raise exception 'sender_not_found' using errcode = 'P0002';
  end if;

  if p_recipient_id is null
     or not exists (select 1 from public.sunners where id = p_recipient_id) then
    raise exception 'recipient_required' using errcode = '23514';
  end if;

  -- Mirrors the kudos_posts_no_self CHECK, but raises the error the form can
  -- actually show instead of a constraint violation.
  if p_recipient_id = v_sender_id then
    raise exception 'recipient_is_self' using errcode = '23514';
  end if;

  if v_title = '' then
    raise exception 'title_required' using errcode = '23514';
  end if;
  if length(v_title) > 120 then
    raise exception 'title_too_long' using errcode = '23514';
  end if;

  if v_message = '' then
    raise exception 'message_required' using errcode = '23514';
  end if;
  if length(v_message) > 2000 then
    raise exception 'message_too_long' using errcode = '23514';
  end if;

  -- Trim, drop blanks, de-duplicate. Two spellings of one tag must not consume
  -- two of the five slots.
  select coalesce(array_agg(t.label order by t.label), '{}'::text[])
    into v_tags
  from (
    select distinct btrim(x) as label
    from unnest(coalesce(p_hashtags, '{}'::text[])) as x
    where btrim(x) <> ''
  ) t;

  if coalesce(array_length(v_tags, 1), 0) = 0 then
    raise exception 'hashtag_required' using errcode = '23514';
  end if;
  -- mm:I520:11647;662:8911 — the button's own caption is "Tối đa 5".
  if array_length(v_tags, 1) > 5 then
    raise exception 'too_many_hashtags' using errcode = '23514';
  end if;

  select coalesce(array_agg(u order by ord), '{}'::text[])
    into v_images
  from unnest(coalesce(p_image_urls, '{}'::text[])) with ordinality as a(u, ord)
  where btrim(u) <> '';

  -- mm:I520:11647;662:9133 — likewise "Tối đa 5".
  if coalesce(array_length(v_images, 1), 0) > 5 then
    raise exception 'too_many_images' using errcode = '23514';
  end if;

  insert into public.kudos_posts (sender_id, recipient_id, title, message, is_anonymous)
  values (v_sender_id, p_recipient_id, v_title, v_message, coalesce(p_is_anonymous, false))
  returning id into v_post_id;

  -- Tags are created on demand: the design's "+ Hashtag" button offers no
  -- closed list, so a label nobody has used before is a new hashtag, matched
  -- to any existing one by slug so "Tận tâm" and "tan tam" stay one tag.
  foreach v_label in array v_tags loop
    v_slug := public.kudos_slugify(v_label);

    insert into public.hashtags (label, slug)
    values (v_label, v_slug)
    on conflict (slug) do nothing;

    select id into v_hashtag_id from public.hashtags where slug = v_slug;

    insert into public.kudos_post_hashtags (post_id, hashtag_id)
    values (v_post_id, v_hashtag_id)
    on conflict do nothing;
  end loop;

  for i in 1 .. coalesce(array_length(v_images, 1), 0) loop
    insert into public.kudos_post_images (post_id, url, position)
    values (v_post_id, v_images[i], i - 1);
  end loop;

  return v_post_id;
end;
$$;

-- Granted to anon as well: with sign-in disabled, every visitor IS anon, and
-- withholding it here would simply mean nobody can post.
grant execute on function public.create_kudos_post(uuid, uuid, text, text, text[], text[], boolean)
  to anon, authenticated;

-- ------------------------------------------------------------------ storage

-- mm:I520:11647;520:9896 — up to five attachments per post.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kudos-images',
  'kudos-images',
  true,
  5242880, -- 5 MB; the board renders these at 88px, nothing here needs more
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "kudos_images_public_read" on storage.objects;
create policy "kudos_images_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'kudos-images');

-- With auth, these were scoped to a folder named for the uploader's uid so one
-- user could not overwrite another's file. There is no uid to scope by now, so
-- the bucket is open to anon within its own `bucket_id`. The remaining
-- protections are the bucket's 5MB limit and its MIME allow-list; path
-- collisions are avoided by the random UUID filename the action generates.
drop policy if exists "kudos_images_owner_insert" on storage.objects;
create policy "kudos_images_insert"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'kudos-images');

-- Delete exists so the action can clean up uploads belonging to a post the
-- database then rejected.
drop policy if exists "kudos_images_owner_delete" on storage.objects;
create policy "kudos_images_delete"
  on storage.objects for delete to anon, authenticated
  using (bucket_id = 'kudos-images');
