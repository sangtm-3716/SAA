"use client";

import { useEffect, useState } from "react";
import type { ActivityEntry } from "@/lib/kudos/types";

/**
 * Live activity ticker, bottom-left of the SPOTLIGHT BOARD — mm:3004:15995,
 * mm:3004:15996, mm:3004:15997, mm:3004:15998, mm:3004:15999 and
 * mm:2940:14230 are six stacked copies of the same line ("08:30PM Nguyễn Bá
 * Chức đã nhận được một Kudos mới" — 14px/20px, weight 700, letter-spacing
 * 0.1px, white, mm:3004:15996 at opacity 0.7, the rest at 0.1/1), Figma's way
 * of mocking a vertical marquee as one static frame. This renders it as a
 * real continuously-scrolling list — fading top/bottom edges stand in for
 * that opacity falloff — and composes each line from `activity` +
 * `activitySuffix` instead of repeating the design's one sample row.
 */
const SCROLL_DURATION_SECONDS = 18;

export function SpotlightTicker({
  activity,
  activitySuffix,
}: {
  activity: ActivityEntry[];
  activitySuffix: string;
}) {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (activity.length === 0) return null;

  const lines = activity.map((entry) => ({
    id: entry.id,
    text: `${formatTickerTime(entry.at)} ${entry.recipientName} ${activitySuffix}`,
  }));
  // Duplicated once so the marquee can loop from -50% back to 0% with no seam.
  const loop = reducedMotion ? lines : [...lines, ...lines];

  return (
    <div
      className="relative h-[72px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes spotlight-ticker-scroll {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
      `}</style>
      <ul
        className="flex flex-col gap-1"
        style={
          reducedMotion
            ? undefined
            : {
                animation: `spotlight-ticker-scroll ${SCROLL_DURATION_SECONDS}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }
        }
      >
        {loop.map((line, index) => (
          // mm:3004:15995..15999 / mm:2940:14230
          <li key={`${line.id}-${index}`} className="truncate text-sm leading-5 font-bold tracking-[0.1px] text-white">
            {line.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTickerTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    .replace(" ", "")
    .toUpperCase();
}
