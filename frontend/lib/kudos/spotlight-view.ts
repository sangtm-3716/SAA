/**
 * Pan/zoom geometry for the SPOTLIGHT BOARD scene (mm:2940:14174).
 *
 * Split from `spotlight-layout.ts`, which owns where the NAMES go; this file
 * owns where the CAMERA is. They share no state — the layout is computed once
 * per name set, the view changes on every drag frame.
 */

import { clamp } from "./spotlight-layout";

/** Pan/zoom state for the board's drag-to-pan + wheel/pinch-to-zoom scene. */
export interface SpotlightView {
  zoom: number;
  pan: { x: number; y: number };
}

/**
 * Keeps the panned scene from leaving the board empty: once zoomed in, the
 * content can slide at most half of the overflow it gained from scaling, in
 * either direction, so some part of it is always still visible.
 */
export function clampPanWithinBounds(x: number, y: number, zoom: number, width: number, height: number) {
  const overflowX = Math.max(0, (width * zoom - width) / 2);
  const overflowY = Math.max(0, (height * zoom - height) / 2);
  return { x: clamp(x, -overflowX, overflowX), y: clamp(y, -overflowY, overflowY) };
}

/**
 * Standard "zoom toward a point" formula: re-centers the pan offset so the
 * point under the cursor/pinch midpoint stays visually fixed as zoom changes.
 */
export function zoomTowardPoint(
  pointerX: number,
  pointerY: number,
  rect: { left: number; top: number; width: number; height: number },
  current: SpotlightView,
  nextZoomRaw: number,
  minZoom: number,
  maxZoom: number,
): SpotlightView {
  const nextZoom = clamp(nextZoomRaw, minZoom, maxZoom);
  const originX = pointerX - rect.left - rect.width / 2;
  const originY = pointerY - rect.top - rect.height / 2;
  const ratio = nextZoom / current.zoom;
  const pan = clampPanWithinBounds(
    originX - (originX - current.pan.x) * ratio,
    originY - (originY - current.pan.y) * ratio,
    nextZoom,
    rect.width,
    rect.height,
  );
  return { zoom: nextZoom, pan };
}
