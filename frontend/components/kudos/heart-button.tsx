"use client";

import { useState, useTransition } from "react";
import { toggleKudosReactionAction } from "@/lib/kudos/reaction-action";
import { MaskedIcon } from "@/components/awards/masked-icon";

/**
 * The heart on a Kudo — mm:I3127:21871;256:5175 (feed card, C.4.1_Hearts) and
 * mm:I2940:13465;335:9462 (highlight card). Shared by both because it is the
 * same affordance; they differ only in how the count is formatted.
 *
 * Figma draws the heart in one state: solid #D4271D beside a count. It had to,
 * because nothing was pressable when the board was drawn. Now that it is, the
 * design has no "I hearted this" variant to transcribe, so the pressed state
 * is this implementation's own — and deliberately conservative: the SAME red,
 * at 30% when un-pressed and full strength when pressed, rather than switching
 * to a grey outline. The row still reads as the designed red heart at a
 * glance; only its weight changes.
 *
 * ## Optimistic, then reconciled
 *
 * The count updates on click and the server's answer overwrites it when it
 * lands. `useState` rather than `useOptimistic`: the action deliberately does
 * NOT revalidate the route (see `lib/kudos/reaction-action.ts`), so there is
 * no incoming server render for `useOptimistic` to rebase onto — the value
 * this component settles on IS the authoritative one, straight from the RPC.
 *
 * A failed call rolls back to the state before the press, so a dead network
 * cannot leave a heart looking pressed when the database never recorded it.
 */
export function HeartButton({
  postId,
  hearts,
  heartedByMe,
  formatCount,
  labels,
}: {
  postId: string;
  hearts: number;
  heartedByMe: boolean;
  /** The two cards format the same number differently; neither should guess. */
  formatCount: (value: number) => string;
  labels: { like: string; unlike: string };
}) {
  const [state, setState] = useState({ liked: heartedByMe, hearts });
  const [isPending, startTransition] = useTransition();

  function press() {
    // Snapshot BEFORE the optimistic flip, so a failure has something true to
    // roll back to.
    const before = state;
    const optimistic = {
      liked: !before.liked,
      hearts: Math.max(0, before.hearts + (before.liked ? -1 : 1)),
    };
    setState(optimistic);

    startTransition(async () => {
      const result = await toggleKudosReactionAction(postId, before);
      setState({ liked: result.liked, hearts: result.hearts });
    });
  }

  return (
    <button
      type="button"
      onClick={press}
      aria-pressed={state.liked}
      aria-label={state.liked ? labels.unlike : labels.like}
      data-testid="kudos-heart-button"
      // `disabled` is deliberately NOT set while pending: a heart is the
      // cheapest thing on the page to press, and locking it for a round-trip
      // makes a double-press feel broken. Presses simply queue, and each one
      // reconciles against the count the database returns.
      className="group flex items-center gap-1 rounded p-1 transition-colors duration-200 ease-out hover:bg-[#FFEA9E]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4271D] motion-reduce:transition-none"
    >
      {/* mm:I3127:21871;256:5174 */}
      <span className="text-2xl leading-8 font-bold text-[#00101A] tabular-nums">
        {formatCount(state.hearts)}
      </span>
      {/* mm:I3127:21871;256:5171 (MM_MEDIA_Heart) */}
      <MaskedIcon
        src="/kudos/icon-heart.svg"
        size={32}
        className={`transition-all duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
          state.liked ? "text-[#D4271D]" : "text-[#D4271D]/30 group-hover:text-[#D4271D]/60"
        } ${isPending ? "opacity-80" : ""}`}
      />
    </button>
  );
}
