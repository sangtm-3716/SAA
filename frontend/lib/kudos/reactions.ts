import { kudosClient } from "./kudos-client";
import { getCurrentSunner } from "./current-sunner";
import type { KudosPost } from "./types";

/**
 * "Which of these Kudos have I hearted?" — mm:I3127:21871;256:5175.
 *
 * The heart COUNT comes from `kudos_post_feed` (a `count(*)`, never a
 * denormalised column). Whether *you* are one of those hearts cannot: the view
 * is one shape for everybody and has no idea who is asking. So it is a second,
 * tiny read, scoped to the post ids actually on screen.
 *
 * It goes through the `kudos_reactions_for_posts` RPC rather than querying the
 * table directly. `kudos_reactions` is public-read, so a direct
 * `where sunner_id = …` is equally how one visitor could enumerate another
 * Sunner's whole reaction history; the definer function answers only for the
 * posts being rendered.
 *
 * Fail-open like every other read here: on any failure the hearts simply
 * render un-pressed. A board you cannot tell your own likes apart on is worth
 * far more than a 500.
 */
export async function withMyReactions(posts: KudosPost[]): Promise<KudosPost[]> {
  if (posts.length === 0) return posts;

  try {
    const sunner = await getCurrentSunner();
    if (!sunner) return posts;

    const { data, error } = await kudosClient().rpc("kudos_reactions_for_posts", {
      p_sunner_id: sunner.id,
      p_post_ids: posts.map((post) => post.id),
    });

    if (error || !data) return posts;

    const hearted = new Set((data as { post_id: string }[]).map((row) => row.post_id));
    return posts.map((post) =>
      hearted.has(post.id) ? { ...post, heartedByMe: true } : post,
    );
  } catch {
    return posts;
  }
}
