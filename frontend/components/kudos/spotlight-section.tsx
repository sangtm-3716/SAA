import { connection } from "next/server";
import { getActivity, getSpotlight } from "@/lib/kudos/queries";
import { SpotlightBoard } from "./spotlight-board";

/**
 * Request-time read for the SPOTLIGHT BOARD (mm:2940:14174).
 *
 * `getSpotlight()` returns both the per-Sunner received counts that scale the
 * cloud's type and the real `count(*)` behind the "388 KUDOS" headline — the
 * number is computed, never hardcoded, so it cannot drift from the data.
 *
 * Isolated behind its own `<Suspense>` boundary at the page level; see
 * `highlight-section.tsx` for why the `connection()` call belongs in the leaf.
 */
export async function SpotlightSection({
  labels,
}: {
  labels: {
    eyebrow: string;
    heading: string;
    kudosSuffix: string;
    searchPlaceholder: string;
    activitySuffix: string;
  };
}) {
  await connection();

  const [spotlight, activity] = await Promise.all([
    getSpotlight(),
    getActivity(),
  ]);

  return (
    <SpotlightBoard
      totalKudos={spotlight.totalKudos}
      names={spotlight.names}
      activity={activity}
      labels={labels}
    />
  );
}
