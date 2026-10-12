import type { KudosBadge, KudosPost } from "./types";

/**
 * Row shape of `public.kudos_post_feed` and its mapping to `KudosPost`.
 *
 * The view already assembles the heart count, the image array and both
 * hashtag arrays per post, so this is a straight field rename with no
 * second query — the N+1 is solved in SQL, not here.
 */
export interface FeedRow {
  id: string;
  title: string | null;
  message: string;
  is_highlight: boolean;
  created_at: string;
  sender_id: string;
  sender_name: string;
  sender_code: string;
  sender_avatar: string | null;
  sender_badge: string;
  recipient_id: string;
  recipient_name: string;
  recipient_code: string;
  recipient_avatar: string | null;
  recipient_badge: string;
  recipient_department_slug: string | null;
  hearts: number;
  image_urls: string[] | null;
  hashtags: string[] | null;
  hashtag_slugs: string[] | null;
}

export const FEED_COLUMNS =
  "id,title,message,is_highlight,created_at,sender_id,sender_name,sender_code,sender_avatar,sender_badge,recipient_id,recipient_name,recipient_code,recipient_avatar,recipient_badge,recipient_department_slug,hearts,image_urls,hashtags,hashtag_slugs";

/**
 * The column is CHECK-constrained in Postgres, but it arrives here as plain
 * text, so an unexpected value falls back to the lowest badge rather than
 * being asserted into the union and breaking `BADGE_IMAGE` lookup at render.
 */
export function toBadge(value: unknown): KudosBadge {
  return value === "rising-hero" || value === "legend-hero" || value === "new-hero"
    ? value
    : "new-hero";
}

export function toPost(row: FeedRow): KudosPost {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    createdAt: row.created_at,
    isHighlight: row.is_highlight,
    hearts: row.hearts ?? 0,
    imageUrls: row.image_urls ?? [],
    hashtags: row.hashtags ?? [],
    hashtagSlugs: row.hashtag_slugs ?? [],
    departmentSlug: row.recipient_department_slug,
    sender: {
      id: row.sender_id,
      name: row.sender_name,
      code: row.sender_code,
      avatarUrl: row.sender_avatar,
      badge: toBadge(row.sender_badge),
    },
    recipient: {
      id: row.recipient_id,
      name: row.recipient_name,
      code: row.recipient_code,
      avatarUrl: row.recipient_avatar,
      badge: toBadge(row.recipient_badge),
    },
  };
}
