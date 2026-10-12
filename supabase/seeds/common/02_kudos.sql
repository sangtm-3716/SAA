-- Seed data for the Sun* Kudos live board (MoMorph screen MaZUn5xHXZ).
--
-- Provenance: the eight Sunner names, the post title, the thank-you message
-- and the two hashtags are transcribed VERBATIM from the Figma screen. The
-- design repeats those same eight names ~130 times across the spotlight cloud,
-- so eight is the faithful count, not a shortcut.
--
-- Two things here are demo scaffolding rather than design content, and are
-- called out so nobody mistakes them for spec:
--   * Department names. The "Phòng ban" filter is collapsed in the design, so
--     its options are not knowable from the file. Four neutral unit names are
--     seeded purely to give the filter something to filter by.
--   * Employee codes. The design prints "CEVC10" under every avatar (filler);
--     distinct codes are generated here because the column is UNIQUE.
--
-- The headline "388 KUDOS" (mm:3007:17482) is reproduced by seeding exactly
-- 388 posts, so the number the board prints is a real count(*) rather than a
-- hardcoded string that would drift the moment a post is added.
--
-- Idempotent: the bulk insert is guarded on the table being empty, and the
-- reference rows use `on conflict do nothing` with fixed UUIDs.

-- ------------------------------------------------------------- departments

insert into public.departments (id, name, slug) values
  ('d0000000-0000-4000-8000-000000000001', 'Khối Công nghệ',   'khoi-cong-nghe'),
  ('d0000000-0000-4000-8000-000000000002', 'Khối Sản phẩm',    'khoi-san-pham'),
  ('d0000000-0000-4000-8000-000000000003', 'Khối Vận hành',    'khoi-van-hanh'),
  ('d0000000-0000-4000-8000-000000000004', 'Khối Kinh doanh',  'khoi-kinh-doanh')
on conflict (id) do nothing;

-- ---------------------------------------------------------------- hashtags
-- "Inspring" is spelled that way in the Figma file (mm:I3127:21871;256:5159).
-- Transcribed as-is rather than silently corrected to "Inspiring".

insert into public.hashtags (id, label, slug) values
  ('11000000-0000-4000-8000-000000000001', 'Dedicated', 'dedicated'),
  ('11000000-0000-4000-8000-000000000002', 'Inspring',  'inspring')
on conflict (id) do nothing;

-- ----------------------------------------------------------------- sunners

insert into public.sunners (id, full_name, employee_code, department_id, avatar_url, badge) values
  ('50000000-0000-4000-8000-000000000001', 'Huỳnh Dương Xuân Nhật', 'CEVC10', 'd0000000-0000-4000-8000-000000000001', '/kudos/avatar-sender.png',    'legend-hero'),
  ('50000000-0000-4000-8000-000000000002', 'Đỗ hoàng Hiệp',         'CEVC11', 'd0000000-0000-4000-8000-000000000001', '/kudos/avatar-recipient.png', 'rising-hero'),
  ('50000000-0000-4000-8000-000000000003', 'Dương thúy An',         'CEVC12', 'd0000000-0000-4000-8000-000000000002', '/kudos/avatar-sunner.png',    'legend-hero'),
  ('50000000-0000-4000-8000-000000000004', 'Mai phương Thúy',       'CEVC13', 'd0000000-0000-4000-8000-000000000002', '/kudos/avatar-recipient.png', 'new-hero'),
  ('50000000-0000-4000-8000-000000000005', 'Nguyễn Văn Quy',        'CEVC14', 'd0000000-0000-4000-8000-000000000003', '/kudos/avatar-sender.png',    'rising-hero'),
  ('50000000-0000-4000-8000-000000000006', 'Lê Kiều Trang',         'CEVC15', 'd0000000-0000-4000-8000-000000000003', '/kudos/avatar-sunner.png',    'legend-hero'),
  ('50000000-0000-4000-8000-000000000007', 'Nguyễn Bá Chức',        'CEVC16', 'd0000000-0000-4000-8000-000000000004', '/kudos/avatar-sender.png',    'new-hero'),
  ('50000000-0000-4000-8000-000000000008', 'Nguyễn Hoàng Linh',     'CEVC17', 'd0000000-0000-4000-8000-000000000004', '/kudos/avatar-recipient.png', 'rising-hero')
on conflict (id) do nothing;

-- ---------------------------------------------------------- reactor pool
-- Heart-givers only. Never rendered anywhere: they send no kudos, receive
-- none, claim no gifts, and `is_featured = false` keeps them out of the
-- spotlight cloud. They exist so heart counts can spread far enough for
-- "the 5 Kudos with the most hearts" to be a real ranking rather than a
-- 130-way tie — see 20261012060000_kudos_featured_sunners.sql.
insert into public.sunners (full_name, employee_code, badge, is_featured)
select
  'Sunner ' || lpad(g::text, 3, '0'),
  'RX' || lpad(g::text, 3, '0'),
  'new-hero',
  false
from generate_series(1, 500) g
on conflict (employee_code) do nothing;

-- ------------------------------------------------------------------- posts

do $$
declare
  -- Only the featured eight send and receive; the reactor pool never appears.
  ids        uuid[] := array(select id from public.sunners where is_featured order by employee_code);
  n          int    := array_length(ids, 1);
  reactors   uuid[] := array(select id from public.sunners where not is_featured order by employee_code);
  rn         int    := array_length(reactors, 1);
  hearts     int;
  -- Recipient draw is deliberately SKEWED, not round-robin. The spotlight
  -- cloud scales each name by its received count, so an even spread would
  -- render every name at identical size and destroy the hierarchy the design
  -- relies on. `weights` repeats Sunner j (n - j + 1) times, giving a smooth
  -- ~86..11 spread across 388 posts while staying fully deterministic.
  weights    int[]  := '{}';
  wn         int;
  msg        text   := 'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...';
  ttl        text   := 'IDOL GIỚI TRẺ';
  post_id    uuid;
  sender     uuid;
  recipient  uuid;
  i          int;
  j          int;
  k          int;
begin
  for j in 1..n loop
    for k in 1..(n - j + 1) loop
      weights := weights || j;
    end loop;
  end loop;
  wn := array_length(weights, 1);

  if exists (select 1 from public.kudos_posts) then
    return;
  end if;

  -- 388 posts => the board's "388 KUDOS" headline is a genuine count.
  for i in 0..387 loop
    sender    := ids[(i % n) + 1];
    recipient := ids[weights[(i % wn) + 1]];
    -- kudos_posts_no_self: nudge to the next Sunner on a collision.
    if sender = recipient then
      recipient := ids[(weights[(i % wn) + 1] % n) + 1];
    end if;

    insert into public.kudos_posts (sender_id, recipient_id, title, message, is_highlight, created_at)
    values (
      sender,
      recipient,
      ttl,
      msg,
      -- 15 highlights fills the carousel's 5 pages (mm:2940:13473 "2/5").
      i < 15,
      -- Spread across the last 30 days, newest first at i = 0.
      now() - (i * interval '1 hour' * 1.85)
    )
    returning id into post_id;

    -- Five 88px attachments, as the card shows (mm:I3127:21871;256:5176).
    -- Only every third post carries them, so the feed is not uniform.
    if i % 3 = 0 then
      for j in 0..4 loop
        insert into public.kudos_post_images (post_id, url, position)
        values (post_id, '/kudos/sample-photo.png', j);
      end loop;
    end if;

    insert into public.kudos_post_hashtags (post_id, hashtag_id)
    values (post_id, '11000000-0000-4000-8000-000000000001');
    if i % 2 = 0 then
      insert into public.kudos_post_hashtags (post_id, hashtag_id)
      values (post_id, '11000000-0000-4000-8000-000000000002');
    end if;

    -- Hearts, drawn from the reactor pool. Still one per Sunner per post
    -- (the composite PK enforces it); the spread comes from how MANY of the
    -- pool react.
    -- Modulus 71 (prime), NOT a multiple of the recipient draw's period of
    -- 36 — a `% 72` cycle locked in step with it and put every one of the
    -- top-5 most-hearted posts on the same recipient. Scaled by 7 with an
    -- `i % 7` offset so the range reaches ~0..496 instead of 0..70: with 388
    -- posts over only 71 values every top slot tied, and a tie is not a
    -- ranking. The offset breaks the remaining ties outright.
    hearts := ((i * 29) % 71) * 7 + (i % 7);
    -- Set-based: one statement per post rather than ~96k single-row inserts.
    insert into public.kudos_reactions (post_id, sunner_id)
    select post_id, reactors[g] from generate_series(1, hearts) g
    on conflict do nothing;
  end loop;
end $$;

-- --------------------------------------------------- secret boxes + prizes

do $$
declare
  ids uuid[] := array(select id from public.sunners order by employee_code);
  i   int;
begin
  if exists (select 1 from public.secret_boxes) then
    return;
  end if;

  for i in 1..array_length(ids, 1) loop
    -- Three opened, two unopened per Sunner => the rail's "đã mở" / "chưa mở"
    -- rows both render non-zero.
    insert into public.secret_boxes (owner_id, reward_label, opened_at)
    select ids[i], 'Áo phông SAA 2025', now() - (g * interval '2 days')
    from generate_series(1, 3) g;

    insert into public.secret_boxes (owner_id, reward_label, opened_at)
    select ids[i], null, null
    from generate_series(1, 2) g;
  end loop;
end $$;

do $$
declare
  ids uuid[] := array(select id from public.sunners order by employee_code);
  i   int;
begin
  if exists (select 1 from public.gift_claims) then
    return;
  end if;

  -- mm:2940:13510 — "10 SUNNER NHẬN QUÀ MỚI NHẤT". Ten claims, newest first,
  -- cycling the eight Sunners.
  for i in 0..9 loop
    insert into public.gift_claims (sunner_id, reward_label, claimed_at)
    values (
      ids[(i % array_length(ids, 1)) + 1],
      'Nhận được 1 áo phông SAA',
      now() - (i * interval '37 minutes')
    );
  end loop;
end $$;
