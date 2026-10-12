import type { SpotlightName } from "./types";

/**
 * Deterministic placement for the SPOTLIGHT BOARD name cloud — mm:2940:14174
 * (B.7_Spotlight). Figma repeats the same 8 names ~130 times at one fixed
 * tiny size (fontSize ≈ 6.66px, e.g. mm:2940:14186) as a dense texture; this
 * instead sizes each instance by `receivedCount` so the cloud reads as a
 * hierarchy, at far fewer repeats since bigger type needs more room.
 * `Math.random()` would reshuffle the cloud on every re-render (and mismatch
 * server/client output), so placement is derived from each name's `id` via a
 * seeded PRNG (mulberry32) — same input, same layout, every time.
 */

export interface PlacedName {
  key: string;
  id: string;
  name: string;
  /** px, left offset within the `{width}x{height}` layout box. */
  x: number;
  /** px, top offset within the `{width}x{height}` layout box. */
  y: number;
  fontSize: number;
  opacity: number;
}

// Capped well below the received-count range (not 1:1 with it) — the longest
// Sunner names otherwise render ~1000px wide at MAX and the cloud collapses
// into illegible overlap. Figma's own texture is a flat ~6.66px; this range
// stays near that density while still carrying the asked-for hierarchy.
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 19;
const DEFAULT_REPEAT = 150;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
// Montserrat Bold runs ~0.72em per character for Vietnamese text. An earlier
// 0.58 under-measured every footprint, so the collision test passed on boxes
// narrower than the glyphs actually drawn — names overlapped anyway, and the
// right-edge clamp let long ones run off the board.
const CHAR_WIDTH_FACTOR = 0.72;
const LINE_HEIGHT_FACTOR = 1.45;
// Generous: a stubborn collision should walk further out the spiral, not give up and overlap.
const MAX_COLLISION_ATTEMPTS = 60;

/** A rectangle the cloud must keep clear, in layout-space px. */
export interface ExclusionZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The board's HUD — the "388 KUDOS" headline, the search field, the activity
 * ticker and the zoom controls — sits ON TOP of the cloud. Without reserved
 * space the names drift underneath and render all four unreadable, so these
 * fractions of the layout box are held clear. Expressed as fractions so they
 * track the board at any size.
 */
export const HUD_EXCLUSIONS: { x: number; y: number; width: number; height: number }[] = [
  { x: 0.28, y: 0.0, width: 0.44, height: 0.2 }, // "388 KUDOS" headline
  { x: 0.0, y: 0.0, width: 0.26, height: 0.14 }, // search field, top-left
  { x: 0.0, y: 0.78, width: 0.62, height: 0.22 }, // activity ticker, bottom-left
  { x: 0.72, y: 0.82, width: 0.28, height: 0.18 }, // zoom controls, bottom-right
];

function insideExclusion(
  zones: ExclusionZone[],
  x: number,
  y: number,
  width: number,
  height: number,
): boolean {
  return zones.some(
    (zone) =>
      x < zone.x + zone.width &&
      x + width > zone.x &&
      y < zone.y + zone.height &&
      y + height > zone.y,
  );
}

function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function scaleFontSize(count: number, min: number, max: number): number {
  if (max === min) return Math.round((MIN_FONT_SIZE + MAX_FONT_SIZE) / 2);
  const t = (count - min) / (max - min);
  return Math.round(MIN_FONT_SIZE + t * (MAX_FONT_SIZE - MIN_FONT_SIZE));
}

function footprint(name: string, fontSize: number): { width: number; height: number } {
  return { width: name.length * fontSize * CHAR_WIDTH_FACTOR, height: fontSize * LINE_HEIGHT_FACTOR };
}

function collides(placed: PlacedName[], x: number, y: number, width: number, height: number): boolean {
  return placed.some((item) => {
    const box = footprint(item.name, item.fontSize);
    return x < item.x + box.width && x + width > item.x && y < item.y + box.height && y + height > item.y;
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function layoutSpotlightNames(
  names: SpotlightName[],
  opts: { width: number; height: number; repeat?: number; exclusions?: ExclusionZone[] },
): PlacedName[] {
  if (names.length === 0) return [];

  const exclusions = opts.exclusions ?? [];

  const repeat = Math.max(names.length, opts.repeat ?? DEFAULT_REPEAT);
  const totalReceived = names.reduce((sum, item) => sum + Math.max(item.receivedCount, 0), 0) || names.length;
  const maxReceived = Math.max(...names.map((item) => item.receivedCount));
  const minReceived = Math.min(...names.map((item) => item.receivedCount));

  // Repeat each name proportionally to its share of total kudos received —
  // the same idea as Figma's repeated-name texture, scaled down to `repeat`.
  const instances: SpotlightName[] = [];
  names.forEach((item) => {
    const share = Math.max(item.receivedCount, 1) / totalReceived;
    const count = Math.max(1, Math.round(share * repeat));
    for (let i = 0; i < count; i += 1) instances.push(item);
  });

  const centerX = opts.width / 2;
  const centerY = opts.height / 2;
  const maxRadius = Math.min(opts.width, opts.height) / 2;
  const placed: PlacedName[] = [];

  instances.forEach((item, index) => {
    const random = mulberry32(hashString(`${item.id}:${index}`));
    const fontSize = scaleFontSize(item.receivedCount, minReceived, maxReceived);
    const box = footprint(item.name, fontSize);

    const maxX = Math.max(0, opts.width - box.width);
    const maxY = Math.max(0, opts.height - box.height);

    let radius = (index / instances.length) * maxRadius;
    let angle = index * GOLDEN_ANGLE + random() * 0.6;
    let x = 0;
    let y = 0;
    let settled = false;

    for (let attempt = 0; attempt <= MAX_COLLISION_ATTEMPTS; attempt += 1) {
      // Clamp BEFORE the collision test, not after. Clamping afterwards moves
      // an accepted position into a neighbour and reintroduces the very
      // overlap the test just cleared.
      x = clamp(centerX + radius * Math.cos(angle) - box.width / 2, 0, maxX);
      y = clamp(centerY + radius * Math.sin(angle) - box.height / 2, 0, maxY);

      if (
        !collides(placed, x, y, box.width, box.height) &&
        !insideExclusion(exclusions, x, y, box.width, box.height)
      ) {
        settled = true;
        break;
      }

      radius += box.height * 0.5;
      angle += GOLDEN_ANGLE * 0.5;
    }

    // A name that still cannot find clear space is DROPPED rather than
    // stacked on top of another. The cloud is decorative density: one fewer
    // repetition is invisible, an overlap is not.
    if (!settled) return;

    placed.push({
      key: `${item.id}-${index}`,
      id: item.id,
      name: item.name,
      x,
      y,
      fontSize,
      opacity: 1,
    });
  });

  return placed;
}
