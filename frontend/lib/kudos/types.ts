/**
 * Shared shapes for the Sun* Kudos live board — MoMorph screen `MaZUn5xHXZ`.
 *
 * This module is the contract between `lib/kudos/queries.ts` (which reads
 * Supabase) and the presentational components under `components/kudos/`.
 * It is deliberately free of any Supabase import so the UI layer never takes
 * a dependency on the database client.
 */

/** The three badge artworks the design ships, mirrored by the `sunners_badge_valid` CHECK. */
export type KudosBadge = "new-hero" | "rising-hero" | "legend-hero";

export const BADGE_IMAGE: Record<KudosBadge, string> = {
  "new-hero": "/kudos/badge-new-hero.png",
  "rising-hero": "/kudos/badge-rising-hero.png",
  "legend-hero": "/kudos/badge-legend-hero.png",
};

export const BADGE_LABEL: Record<KudosBadge, string> = {
  "new-hero": "New Hero",
  "rising-hero": "Rising Hero",
  "legend-hero": "Legend Hero",
};

/** One party on a kudos card — mm:I3127:21871;256:4858 / ;256:4860. */
export interface KudosSunner {
  id: string;
  /** mm:…;256:4735 — 16px/24px bold, centred. */
  name: string;
  /** mm:…;256:4741 — the small code under the name, e.g. "CEVC10". */
  code: string;
  avatarUrl: string | null;
  badge: KudosBadge;
}

/** One card in the feed (mm:3127:21871) or the carousel (mm:2940:13461). */
export interface KudosPost {
  id: string;
  sender: KudosSunner;
  recipient: KudosSunner;
  /** mm:I3127:21871;2234:33039 — the all-caps line, e.g. "IDOL GIỚI TRẺ". */
  title: string | null;
  message: string;
  /** ISO 8601. Formatted for display as `10:00 - 10/30/2025`. */
  createdAt: string;
  /** mm:I3127:21871;256:5176 — up to five 88px thumbnails. */
  imageUrls: string[];
  /** Labels WITHOUT the leading `#`; the UI adds it. */
  hashtags: string[];
  /** Slugs parallel to `hashtags`, for matching against `FilterOption.value`. */
  hashtagSlugs: string[];
  /** mm:I3127:21871;256:5174 — `count(*)` over kudos_reactions, never denormalised. */
  hearts: number;
  isHighlight: boolean;
  /**
   * Recipient's department slug, so the "Phòng ban" dropdown
   * (mm:2940:13452) can actually narrow the carousel client-side. The post
   * is attributed to whoever RECEIVED it, matching how the board reads —
   * it celebrates the recipient, not the sender.
   */
  departmentSlug: string | null;
}

/** One name in the spotlight cloud — mm:2940:14174. */
export interface SpotlightName {
  id: string;
  name: string;
  /** Drives the type size in the cloud. */
  receivedCount: number;
}

/** One line of the live ticker — mm:3004:15995..15999. */
export interface ActivityEntry {
  id: string;
  /** ISO 8601; rendered as `08:30PM` in the ticker. */
  at: string;
  recipientName: string;
}

/** The right-rail counters — mm:2940:13489 (D.1). */
export interface BoardStats {
  received: number;
  sent: number;
  hearts: number;
  secretBoxesOpened: number;
  secretBoxesUnopened: number;
}

/** One row of "10 SUNNER NHẬN QUÀ MỚI NHẤT" — mm:2940:13510 (D.3). */
export interface GiftClaim {
  id: string;
  sunnerName: string;
  avatarUrl: string | null;
  rewardLabel: string;
  claimedAt: string;
}

/** An option in the Hashtag / Phòng ban dropdowns — mm:2940:13452. */
export interface FilterOption {
  value: string;
  label: string;
}

export interface KudosFilters {
  hashtag?: string;
  department?: string;
}
