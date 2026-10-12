"use server";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { getCurrentSunner } from "./current-sunner";

/**
 * Presses (or un-presses) the heart on one Kudo — mm:I3127:21871;256:5175.
 *
 * Returns the state the DATABASE settled on, not the client's guess. The
 * button updates optimistically so the press feels instant, then reconciles
 * against this: a count that drifted because someone else hearted the same
 * post in the meantime corrects itself on the next press rather than
 * compounding.
 *
 * ## Why this does not `revalidatePath("/kudos")`
 *
 * It would be the reflex, and it is wrong here. The board runs three separate
 * request-time Supabase reads (highlight, spotlight, feed); revalidating would
 * re-run all of them on every heart press — the cheapest, most repeatable
 * interaction on the page — and the only thing that could actually change for
 * the presser is one number they are already being shown. Other people's
 * hearts, and the HIGHLIGHT carousel's heart ranking, refresh on the next
 * load, which is soon enough for a leaderboard measured in hundreds.
 *
 * NO AUTHENTICATION: the sender is the mocked current user, as everywhere else
 * on this screen. See `lib/kudos/current-sunner.ts`.
 */

export interface ToggleReactionResult {
  ok: boolean;
  liked: boolean;
  hearts: number;
}

export async function toggleKudosReactionAction(
  postId: string,
  /** Where to fall back to if the call fails — the UI rolls back to this. */
  fallback: { liked: boolean; hearts: number },
): Promise<ToggleReactionResult> {
  try {
    const sunner = await getCurrentSunner();
    if (!sunner) return { ok: false, ...fallback };

    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.rpc("toggle_kudos_reaction", {
      p_post_id: postId,
      p_sunner_id: sunner.id,
    });

    // A `returns table(...)` function arrives as an array of one row.
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return { ok: false, ...fallback };

    return {
      ok: true,
      liked: Boolean((row as { liked: boolean }).liked),
      hearts: Number((row as { hearts: number }).hearts),
    };
  } catch {
    return { ok: false, ...fallback };
  }
}
