import { DEMO_SUNNER_CODE, kudosClient } from "./kudos-client";
import type { BoardStats, GiftClaim } from "./types";

/**
 * Reads behind the board's right rail — mm:2940:13489 (D.1 stat rows) and
 * mm:2940:13510 (D.3 "10 SUNNER NHẬN QUÀ MỚI NHẤT").
 *
 * Split from `queries.ts` to keep both files inside the project's 200-line
 * budget. Same fail-open contract: never throws, never rejects.
 */

const EMPTY_STATS: BoardStats = {
  received: 0,
  sent: 0,
  hearts: 0,
  secretBoxesOpened: 0,
  secretBoxesUnopened: 0,
};

export async function getBoardStats(): Promise<BoardStats> {
  try {
    const supabase = kudosClient();
    const { data: sunner } = await supabase
      .from("sunners")
      .select("id")
      .eq("employee_code", DEMO_SUNNER_CODE)
      .maybeSingle();

    if (!sunner) return EMPTY_STATS;
    const sunnerId = (sunner as { id: string }).id;

    const [received, sent, opened, unopened, hearts] = await Promise.all([
      supabase
        .from("kudos_posts")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", sunnerId),
      supabase
        .from("kudos_posts")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", sunnerId),
      supabase
        .from("secret_boxes")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", sunnerId)
        .not("opened_at", "is", null),
      supabase
        .from("secret_boxes")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", sunnerId)
        .is("opened_at", null),
      // Hearts received = reactions on posts addressed to this Sunner.
      supabase
        .from("kudos_post_feed")
        .select("hearts")
        .eq("recipient_id", sunnerId),
    ]);

    const heartTotal = ((hearts.data ?? []) as { hearts: number }[]).reduce(
      (sum, row) => sum + (row.hearts ?? 0),
      0,
    );

    return {
      received: received.count ?? 0,
      sent: sent.count ?? 0,
      hearts: heartTotal,
      secretBoxesOpened: opened.count ?? 0,
      secretBoxesUnopened: unopened.count ?? 0,
    };
  } catch {
    return EMPTY_STATS;
  }
}

export async function getGiftClaims(limit = 10): Promise<GiftClaim[]> {
  try {
    const { data, error } = await kudosClient()
      .from("gift_claims")
      .select("id,reward_label,claimed_at,sunners(full_name,avatar_url)")
      .order("claimed_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (
      data as unknown as {
        id: string;
        reward_label: string;
        claimed_at: string;
        sunners: { full_name: string; avatar_url: string | null } | null;
      }[]
    ).map((row) => ({
      id: row.id,
      sunnerName: row.sunners?.full_name ?? "",
      avatarUrl: row.sunners?.avatar_url ?? null,
      rewardLabel: row.reward_label,
      claimedAt: row.claimed_at,
    }));
  } catch {
    return [];
  }
}
