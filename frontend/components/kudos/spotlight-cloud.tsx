"use client";

import { useMemo } from "react";
import { HUD_EXCLUSIONS, layoutSpotlightNames } from "@/lib/kudos/spotlight-layout";
import type { SpotlightName } from "@/lib/kudos/types";

/**
 * The name-cloud texture behind the SPOTLIGHT BOARD counter — mm:2940:14174
 * (B.7_Spotlight) generates it from ~130 individually-placed TEXT nodes
 * (e.g. mm:2940:14186, mm:2995:15926 — both "Đỗ hoàng Hiệp", 6.66px, white,
 * `textAlign: center`), all at one fixed size. `layoutSpotlightNames`
 * reproduces that repeated-name texture deterministically but maps each
 * instance's size to its `receivedCount` so the cloud reads as a hierarchy
 * instead of a flat watermark — see spotlight-layout.ts for the exact range.
 *
 * Virtual layout space mirrors the board's own aspect ratio (mm:2940:14174
 * is 1157x548). `left`/`top` use `%` (relative to this element's box, which
 * fills the board at any viewport width); `font-size` uses `cqw` (relative
 * to the nearest CSS container's inline size) so type scales fluidly with
 * the same 1157px reference — the board root sets `container-type:
 * inline-size` for this to resolve against.
 */
const LAYOUT_WIDTH = 1157;
const LAYOUT_HEIGHT = 548;

const DIMMED_OPACITY_FACTOR = 0.2;

/**
 * Inline style values are rounded to 3 decimals, and colour is applied with a
 * class rather than a style, to avoid a hydration mismatch.
 *
 * The browser normalises what it parses out of a `style` attribute: it
 * truncates high-precision CSS numbers (`32.11102324485698%` becomes
 * `32.111%`) and rewrites hex colours to `rgb()`. React then compares its
 * full-precision client value against that normalised server value, finds
 * them different, and warns. Emitting values already in the browser's own
 * normal form makes the two sides agree. Rounding to 3 decimals is also far
 * below one device pixel at this scale, so nothing moves.
 */
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function SpotlightCloud({
  names,
  searchQuery,
}: {
  names: SpotlightName[];
  searchQuery: string;
}) {
  const placed = useMemo(
    () =>
      layoutSpotlightNames(names, {
        width: LAYOUT_WIDTH,
        height: LAYOUT_HEIGHT,
        // Keep the cloud out from under the headline, search box, ticker and
        // zoom controls, which are painted over it.
        exclusions: HUD_EXCLUSIONS.map((zone) => ({
          x: zone.x * LAYOUT_WIDTH,
          y: zone.y * LAYOUT_HEIGHT,
          width: zone.width * LAYOUT_WIDTH,
          height: zone.height * LAYOUT_HEIGHT,
        })),
      }),
    [names],
  );
  const query = searchQuery.trim().toLocaleLowerCase("vi");
  const isSearching = query.length > 0;

  return (
    <div className="pointer-events-none absolute inset-0">
      {placed.map((item) => {
        const isMatch = isSearching && item.name.toLocaleLowerCase("vi").includes(query);
        const dimmed = isSearching && !isMatch;
        return (
          <span
            key={item.key}
            className={`absolute leading-none font-bold whitespace-nowrap transition-[color,opacity] duration-200 motion-reduce:transition-none ${
              isMatch ? "text-[#FFEA9E]" : "text-white"
            }`}
            style={{
              left: `${round((item.x / LAYOUT_WIDTH) * 100)}%`,
              top: `${round((item.y / LAYOUT_HEIGHT) * 100)}%`,
              fontSize: `${round((item.fontSize / LAYOUT_WIDTH) * 100)}cqw`,
              opacity: round(
                dimmed ? item.opacity * DIMMED_OPACITY_FACTOR : item.opacity,
              ),
            }}
          >
            {item.name}
          </span>
        );
      })}
    </div>
  );
}
