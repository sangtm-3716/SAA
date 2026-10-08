"use client";

import { CountdownDisplay } from "@/components/countdown/countdown-display";
import { useCountdown } from "@/lib/countdown/use-countdown";
import type { CountdownParts } from "@/lib/countdown/compute-countdown";

export interface CountdownTickerProps {
  targetISO: string | null;
  initial: CountdownParts;
  title: string;
  labels: { days: string; hours: string; minutes: string };
}

/**
 * Thin client seam between the server-resolved strings/instant and the
 * presentational `CountdownDisplay` (phase 06, untouched). Keeps the
 * display itself free of hooks and state so it can be re-run from Figma
 * without reasoning about the timer — see phase-07 "Architecture".
 *
 * `useCountdown` seeds from `initial` (computed server-side) and only
 * touches `Date.now()` inside `useEffect`, so the first client render is
 * byte-identical to the server's HTML — no hydration mismatch, no
 * `suppressHydrationWarning`.
 */
export function CountdownTicker({
  targetISO,
  initial,
  title,
  labels,
}: CountdownTickerProps) {
  const parts = useCountdown(targetISO, initial);

  return (
    <CountdownDisplay
      title={title}
      days={parts.days}
      hours={parts.hours}
      minutes={parts.minutes}
      labels={labels}
    />
  );
}
