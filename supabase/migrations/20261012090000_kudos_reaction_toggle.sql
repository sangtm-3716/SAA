-- Let people press the heart — the follow-up 20261012034500 named explicitly:
--
--   "`kudos_reactions` is the one table a later 'let people press the heart'
--    phase will need a write policy on. It is intentionally omitted here: an
--    insert policy open to anon would let anybody inflate the heart counts the
--    board displays, and the board currently only reads them."
--
-- That reasoning still holds, so this does NOT add an insert policy. The table
-- stays unwritable from any client, exactly like `kudos_posts`, and gains one
-- security-definer RPC as its only write path — the same shape
-- `create_kudos_post` uses.
--
-- The vote-stuffing guard is the table's own composite primary key
-- `(post_id, sunner_id)`: one heart per Sunner per post, enforced by the
-- schema rather than by the application remembering to check. A Sunner
-- pressing twice un-hearts rather than double-hearting.
--
-- NO AUTHENTICATION, as with the compose screen: `p_sunner_id` is a parameter
-- because there is no session to read an identity from, so anyone can heart as
-- anyone. Acceptable for a demo with no accounts; with sign-in this becomes
-- `auth.uid()` and the parameter disappears.

-- Toggles this Sunner's heart on one post and reports the result.
--
-- Returns the new state AND the fresh count together so the UI needs no second
-- round-trip to re-read what it just changed — and so the number it settles on
-- is the database's, not the client's own optimistic arithmetic.
create or replace function public.toggle_kudos_reaction(
  p_post_id   uuid,
  p_sunner_id uuid
)
returns table (liked boolean, hearts integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_removed int;
  v_liked   boolean;
begin
  if p_post_id is null
     or not exists (select 1 from public.kudos_posts where id = p_post_id) then
    raise exception 'post_not_found' using errcode = 'P0002';
  end if;

  if p_sunner_id is null
     or not exists (select 1 from public.sunners where id = p_sunner_id) then
    raise exception 'sunner_not_found' using errcode = 'P0002';
  end if;

  -- Delete-then-insert rather than "look, then decide": the lookup version has
  -- a window between the SELECT and the write where a second click can land,
  -- and the two presses would then both insert (one failing on the PK) or both
  -- delete. Here each branch is a single statement whose own row count decides
  -- the outcome, so concurrent presses serialise into a real toggle.
  delete from public.kudos_reactions
  where post_id = p_post_id and sunner_id = p_sunner_id;

  get diagnostics v_removed = row_count;

  if v_removed = 0 then
    insert into public.kudos_reactions (post_id, sunner_id)
    values (p_post_id, p_sunner_id)
    on conflict (post_id, sunner_id) do nothing;
    v_liked := true;
  else
    v_liked := false;
  end if;

  return query
  select
    v_liked,
    (select count(*)::int from public.kudos_reactions where post_id = p_post_id);
end;
$$;

-- anon included: with sign-in disabled every visitor is anon, and withholding
-- this would simply mean nobody can press the heart.
grant execute on function public.toggle_kudos_reaction(uuid, uuid) to anon, authenticated;

-- "Which of these posts have I hearted?" — asked once per board render for the
-- handful of posts on screen.
--
-- A plain `select post_id from kudos_reactions where sunner_id = $1 and
-- post_id = any($2)` would do the same work and needs no function, but
-- `kudos_reactions` is public-read, so that query is also how one visitor
-- could enumerate another Sunner's entire reaction history. Routing it through
-- a definer function keeps the answer scoped to the posts actually being
-- rendered.
create or replace function public.kudos_reactions_for_posts(
  p_sunner_id uuid,
  p_post_ids  uuid[]
)
returns table (post_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select k.post_id
  from public.kudos_reactions k
  where k.sunner_id = p_sunner_id
    and k.post_id = any(coalesce(p_post_ids, '{}'::uuid[]));
$$;

grant execute on function public.kudos_reactions_for_posts(uuid, uuid[]) to anon, authenticated;
