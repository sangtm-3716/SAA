import { kudosClient } from "./kudos-client";
import { FEED_COLUMNS, toPost, type FeedRow } from "./feed-row";
import type {
  ActivityEntry,
  FilterOption,
  KudosFilters,
  KudosPost,
} from "./types";

/**
 * Reads for the Sun* Kudos live board — MoMorph screen `MaZUn5xHXZ`.
 *
 * Fail-open, exactly as `lib/event/event-settings.ts`: no function here ever
 * throws or rejects. Supabase down, RLS denial, timeout, malformed row — all
 * resolve an empty list or a zeroed stat block, and the board renders its
 * empty state instead of a 500. Supabase is routinely stopped on dev
 * machines here, so this is the common path, not a corner case.
 */

export async function getKudosFeed(
  { hashtag, department }: KudosFilters = {},
  limit = 10,
  offset = 0,
): Promise<KudosPost[]> {
  try {
    let query = kudosClient()
      .from("kudos_post_feed")
      .select(FEED_COLUMNS)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (hashtag) {
      query = query.contains("hashtag_slugs", [hashtag]);
    }
    if (department) {
      query = query.eq("recipient_department_slug", department);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as FeedRow[]).map(toPost);
  } catch {
    return [];
  }
}

/**
 * "Highlight Kudos — the 5 Kudos with the most hearts."
 *
 * Ranked by heart count, NOT by the `kudos_posts.is_highlight` flag: the
 * feature is defined as a leaderboard, so an editorial boolean would let the
 * section disagree with the counts printed on its own cards. The flag stays
 * in the schema for a future hand-picked override; nothing reads it today.
 *
 * Filtering happens HERE rather than client-side, because "top 5 of the
 * filtered set" cannot be computed from a top-5 that was already narrowed —
 * the ranking has to be re-run against the filtered rows in SQL.
 *
 * `created_at` breaks ties so the order is stable between requests.
 */
export async function getHighlightPosts(
  { hashtag, department }: KudosFilters = {},
  limit = 5,
): Promise<KudosPost[]> {
  try {
    let query = kudosClient()
      .from("kudos_post_feed")
      .select(FEED_COLUMNS)
      .order("hearts", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (hashtag) {
      query = query.contains("hashtag_slugs", [hashtag]);
    }
    if (department) {
      query = query.eq("recipient_department_slug", department);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as FeedRow[]).map(toPost);
  } catch {
    return [];
  }
}

export async function getSpotlight(): Promise<{
  totalKudos: number;
  names: { id: string; name: string; receivedCount: number }[];
}> {
  try {
    const supabase = kudosClient();
    const [namesResult, countResult] = await Promise.all([
      supabase
        .from("kudos_spotlight_names")
        .select("id,full_name,received_count")
        .order("received_count", { ascending: false }),
      // `head: true` asks PostgREST for the count without shipping 388 rows.
      supabase.from("kudos_posts").select("id", { count: "exact", head: true }),
    ]);

    const names = (namesResult.data ?? []).map(
      (row: { id: string; full_name: string; received_count: number }) => ({
        id: row.id,
        name: row.full_name,
        receivedCount: row.received_count ?? 0,
      }),
    );

    return { totalKudos: countResult.count ?? 0, names };
  } catch {
    return { totalKudos: 0, names: [] };
  }
}

export async function getActivity(limit = 12): Promise<ActivityEntry[]> {
  try {
    const { data, error } = await kudosClient()
      .from("kudos_activity_feed")
      .select("id,at,recipient_name")
      .limit(limit);

    if (error || !data) return [];
    return (data as { id: string; at: string; recipient_name: string }[]).map(
      (row) => ({ id: row.id, at: row.at, recipientName: row.recipient_name }),
    );
  } catch {
    return [];
  }
}

export async function getFilterOptions(): Promise<{
  hashtags: FilterOption[];
  departments: FilterOption[];
}> {
  try {
    const supabase = kudosClient();
    const [tags, depts] = await Promise.all([
      supabase.from("hashtags").select("slug,label").order("label"),
      supabase.from("departments").select("slug,name").order("name"),
    ]);

    return {
      hashtags: ((tags.data ?? []) as { slug: string; label: string }[]).map(
        (row) => ({ value: row.slug, label: `#${row.label}` }),
      ),
      departments: ((depts.data ?? []) as { slug: string; name: string }[]).map(
        (row) => ({ value: row.slug, label: row.name }),
      ),
    };
  } catch {
    return { hashtags: [], departments: [] };
  }
}
