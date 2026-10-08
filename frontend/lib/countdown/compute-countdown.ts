/**
 * Pure, synchronous conversion of two ISO instants into countdown display parts.
 *
 * `nowISO` is a parameter rather than `Date.now()` so this function stays deterministic —
 * the unit layer (and the server that renders the first paint) can evaluate it at any instant,
 * with no timers, no locale, and no timezone library involved. The target instant is always
 * absolute; whatever timezone was used to pick it (e.g. Asia/Ho_Chi_Minh) is baked into the
 * ISO string already, not re-applied here.
 *
 * Truncation only, never rounding (`Math.floor` throughout): a displayed value only ever
 * decreases as real time passes, it never ticks upward.
 *
 * `hours` and `minutes` are bounded to 00-23 / 00-59 by the `% 24` / `% 60` arithmetic itself —
 * there is no reachable raw value of -1, 25, or 60 to defend against, so no clamp/validation
 * branch is added for those cases. Adding one would be dead code implying a state that cannot
 * occur.
 *
 * `days` is deliberately NOT capped at two digits: it is zero-padded to a MINIMUM of two
 * digits. A countdown of 100+ days renders "100", never a truncated two-digit lie.
 */

export type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
};

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

const ZERO: CountdownParts = { days: "00", hours: "00", minutes: "00" };

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function computeCountdown(targetISO: string, nowISO: string): CountdownParts {
  const targetMs = Date.parse(targetISO);
  const nowMs = Date.parse(nowISO);

  if (Number.isNaN(targetMs) || Number.isNaN(nowMs)) {
    return ZERO;
  }

  const remaining = targetMs - nowMs;

  if (remaining <= 0) {
    return ZERO;
  }

  return {
    days: pad(Math.floor(remaining / MS_PER_DAY)),
    hours: pad(Math.floor(remaining / MS_PER_HOUR) % 24),
    minutes: pad(Math.floor(remaining / MS_PER_MINUTE) % 60),
  };
}
