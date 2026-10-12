-- Seed data for the "Viết Kudo" compose screen (MoMorph screen ihQ26W78P2).
--
-- Two dropdowns on that screen need options that the board seed does not
-- supply. The third ("Người nhận") reads `public.sunners`, which 02_kudos.sql
-- already fills with the eight Figma Sunners, so nothing is added for it here.
--
-- Provenance, stated plainly so nobody mistakes demo scaffolding for spec:
--   * The ONE award title transcribed from the design is "Người truyền động
--     lực cho tôi" — it is the worked example in the field's own helper text
--     (mm:I520:11647;1688:10447). Every other title below is invented to give
--     the dropdown a usable list; the Figma dropdown is drawn closed, so its
--     real options are not knowable from the file.
--   * Likewise the hashtags. 02_kudos.sql seeds the two the board prints
--     ("Dedicated" and "Inspring" — the latter spelled that way in Figma).
--     A picker offering two options is not a picker, so eight more are added.
--     The RPC creates unknown tags on demand, so this list is a starting
--     point, never a closed vocabulary.
--
-- Idempotent: fixed UUIDs with `on conflict do nothing`, so a re-seed over a
-- live database adds nothing twice and overwrites nothing.

-- ---------------------------------------------------------- award titles
-- mm:I520:11647;1688:10437 ("Danh hiệu") — `position` is the display order;
-- the transcribed example leads the list.

insert into public.kudos_award_titles (id, label, position) values
  ('a1000000-0000-4000-8000-000000000001', 'Người truyền động lực cho tôi',   1),
  ('a1000000-0000-4000-8000-000000000002', 'Người đồng đội tôi tin tưởng',    2),
  ('a1000000-0000-4000-8000-000000000003', 'Người luôn sẵn sàng giúp đỡ',     3),
  ('a1000000-0000-4000-8000-000000000004', 'Người giải cứu deadline',         4),
  ('a1000000-0000-4000-8000-000000000005', 'Người lắng nghe tuyệt vời',       5),
  ('a1000000-0000-4000-8000-000000000006', 'Người mang năng lượng tích cực',  6),
  ('a1000000-0000-4000-8000-000000000007', 'Người thầy thầm lặng',            7),
  ('a1000000-0000-4000-8000-000000000008', 'Người gắn kết cả đội',            8),
  ('a1000000-0000-4000-8000-000000000009', 'Người dám nhận việc khó',         9),
  ('a1000000-0000-4000-8000-00000000000a', 'Người chỉn chu đến từng chi tiết', 10)
on conflict (id) do nothing;

-- -------------------------------------------------------------- hashtags
-- mm:I520:11647;662:8911 ("+ Hashtag", max 5). Slugs are ASCII so they match
-- what `public.kudos_slugify` produces for the same label — otherwise a user
-- re-typing a seeded tag would mint a duplicate under a different slug.

insert into public.hashtags (id, label, slug) values
  ('11000000-0000-4000-8000-000000000003', 'Teamwork',   'teamwork'),
  ('11000000-0000-4000-8000-000000000004', 'Supportive', 'supportive'),
  ('11000000-0000-4000-8000-000000000005', 'Creative',   'creative'),
  ('11000000-0000-4000-8000-000000000006', 'Proactive',  'proactive'),
  ('11000000-0000-4000-8000-000000000007', 'Reliable',   'reliable'),
  ('11000000-0000-4000-8000-000000000008', 'Mentor',     'mentor'),
  ('11000000-0000-4000-8000-000000000009', 'OnTime',     'ontime'),
  ('11000000-0000-4000-8000-00000000000a', 'GoTheExtraMile', 'gotheextramile')
on conflict (id) do nothing;
