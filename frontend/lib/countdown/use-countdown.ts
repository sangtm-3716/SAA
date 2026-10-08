"use client";

import { useEffect, useState } from "react";

import { computeCountdown, type CountdownParts } from "./compute-countdown";

const ZERO: CountdownParts = { days: "00", hours: "00", minutes: "00" };

function isZero(parts: CountdownParts): boolean {
  return parts.days === "00" && parts.hours === "00" && parts.minutes === "00";
}

/**
 * `initial` is a required parameter, not something this hook computes itself, because the
 * first client render must be byte-identical to what the server already sent down. The server
 * calls `computeCountdown(targetISO, now)` once and passes the result in as `initial`; this
 * hook seeds `useState` from it and does no time-based computation during render. Only inside
 * `useEffect` — which runs after hydration, never during it — does the hook touch `new Date()`.
 * Computing from `Date.now()` during render would make the client's first paint diverge from
 * the server's HTML and trigger a hydration mismatch; `suppressHydrationWarning` would hide
 * that bug rather than fix it, so it is not used here.
 *
 * The clock is the client's own, but the instant (`targetISO`) came from the server. A skewed
 * client clock can only make the displayed countdown cosmetically wrong — it can never unlock
 * navigation early, because that gate lives in middleware, not here.
 */
export function useCountdown(
  targetISO: string | null,
  initial: CountdownParts,
): CountdownParts {
  const [parts, setParts] = useState(initial);

  useEffect(() => {
    if (targetISO === null) {
      return;
    }

    const evaluate = () => computeCountdown(targetISO, new Date().toISOString());

    const first = evaluate();
    // This synchronous setState is the documented "close the server-hydrate gap" tick
    // (phase-04 architecture): the first render must stay `initial`-only for hydration
    // safety, so the one-time correction has to happen after mount, inside this effect,
    // not during render. That is a deliberate, spec-required exception to the general
    // "derive during render" guidance this lint rule otherwise enforces.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParts(first);
    if (isZero(first)) {
      return;
    }

    const id = setInterval(() => {
      const next = evaluate();
      setParts(next);
      if (isZero(next)) {
        clearInterval(id);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [targetISO]);

  // `targetISO === null` has no timer and no external system to synchronize with — it is a
  // constant, computable during render, so it is returned directly rather than routed through
  // a setState call inside the effect above.
  if (targetISO === null) {
    return ZERO;
  }

  return parts;
}
