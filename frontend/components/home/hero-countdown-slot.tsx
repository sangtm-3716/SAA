import { connection } from "next/server";
import { computeCountdown } from "@/lib/countdown/compute-countdown";
import { getEventStartsAt } from "@/lib/event/event-settings";
import { HeroCountdownTicker } from "./hero-countdown-ticker";

export interface HeroCountdownSlotProps {
  countdownLabel: string;
  unitLabels: { days: string; hours: string; minutes: string };
}

/**
 * The one request-time read on an otherwise static homepage.
 *
 * `getEventStartsAt()` consults `Date.now()` for its cache-TTL check, which
 * `cacheComponents` treats as uncached data. Calling it from the page body
 * makes the WHOLE route blocking — Next reports "`connection()` accessed
 * outside of `<Suspense>` prevents the route from being prerendered". Keeping
 * both the `connection()` opt-in and the read inside this leaf component lets
 * the page wrap just this subtree in `<Suspense>`: the hero copy, the essay,
 * the award grid and the footer all prerender, and only the countdown
 * streams in.
 *
 * Fail-open, as everywhere else this instant is read: `getEventStartsAt()`
 * resolves `null` on any failure, and `computeCountdown` returns the all-zero
 * state for an unparseable target, so this renders "00/00/00" rather than
 * throwing.
 */
export async function HeroCountdownSlot({
  countdownLabel,
  unitLabels,
}: HeroCountdownSlotProps) {
  await connection();

  const targetISO = await getEventStartsAt();
  const initial = computeCountdown(targetISO ?? "", new Date().toISOString());

  return (
    <HeroCountdownTicker
      targetISO={targetISO}
      initial={initial}
      countdownLabel={countdownLabel}
      unitLabels={unitLabels}
    />
  );
}
