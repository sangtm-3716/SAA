"use client";

import { HeroCountdown } from "@/components/home/hero-countdown";
import { useCountdown } from "@/lib/countdown/use-countdown";
import type { CountdownParts } from "@/lib/countdown/compute-countdown";

export interface HeroCountdownTickerProps {
  targetISO: string | null;
  initial: CountdownParts;
  countdownLabel: string;
  unitLabels: { days: string; hours: string; minutes: string };
}

/**
 * Client seam between the server-resolved launch instant and the purely
 * presentational `HeroCountdown`, mirroring
 * `components/countdown/countdown-ticker.tsx` exactly — same hook, same
 * hydration contract, different display component.
 *
 * It exists for the same reason that one does: `useCountdown` seeds from
 * `initial` (computed on the server) and only touches `Date.now()` inside
 * `useEffect`, so the first client render is byte-identical to the server's
 * HTML. Keeping the hook here leaves `HeroCountdown` free of state, so the
 * Figma-derived markup can be re-run from the design without reasoning
 * about the timer.
 */
export function HeroCountdownTicker({
  targetISO,
  initial,
  countdownLabel,
  unitLabels,
}: HeroCountdownTickerProps) {
  const parts = useCountdown(targetISO, initial);

  return (
    <HeroCountdown
      countdownLabel={countdownLabel}
      days={parts.days}
      hours={parts.hours}
      minutes={parts.minutes}
      unitLabels={unitLabels}
    />
  );
}
