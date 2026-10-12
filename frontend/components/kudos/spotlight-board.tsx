"use client";

import { useEffect, useRef, useState } from "react";
import { MaskedIcon } from "@/components/awards/masked-icon";
import { clampPanWithinBounds, zoomTowardPoint } from "@/lib/kudos/spotlight-view";
import type { ActivityEntry, SpotlightName } from "@/lib/kudos/types";
import { SpotlightCloud } from "./spotlight-cloud";
import { SpotlightTicker } from "./spotlight-ticker";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const WHEEL_ZOOM_STEP = 0.12;

type Pan = { x: number; y: number };
type SpotlightBoardLabels = {
  eyebrow: string;
  heading: string;
  kudosSuffix: string;
  searchPlaceholder: string;
  activitySuffix: string;
};

/**
 * SPOTLIGHT BOARD — mm:2940:14170 (header mm:2940:13476, same idiom as
 * `AwardSystem`) over the pan/zoom board mm:2940:14174 (1157x548, `#998C5F`
 * border, 47.14px radius). mm:3007:17479 ships empty with no exported
 * glyphs, so its control icons are authored inline. Drag pans, wheel zooms
 * toward the pointer (0.5x-3x); pinch is skipped for the project's 200-line
 * file budget — drag + wheel already cover the required interaction.
 */
export function SpotlightBoard({
  totalKudos,
  names,
  activity,
  labels,
}: {
  totalKudos: number;
  names: SpotlightName[];
  activity: ActivityEntry[];
  labels: SpotlightBoardLabels;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dragOrigin = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === boardRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  function zoomAt(clientX: number, clientY: number, nextZoomRaw: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = zoomTowardPoint(clientX, clientY, rect, { zoom, pan }, nextZoomRaw, MIN_ZOOM, MAX_ZOOM);
    setZoom(next.zoom);
    setPan(next.pan);
  }
  function zoomAtCenter(nextZoom: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, nextZoom);
  }
  function handlePointerDown(event: React.PointerEvent) {
    if (event.button !== 0) return;
    (event.target as Element).setPointerCapture(event.pointerId);
    dragOrigin.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    setIsDragging(true);
  }
  function handlePointerMove(event: React.PointerEvent) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!dragOrigin.current || !rect) return;
    const x = dragOrigin.current.panX + (event.clientX - dragOrigin.current.x);
    const y = dragOrigin.current.panY + (event.clientY - dragOrigin.current.y);
    setPan(clampPanWithinBounds(x, y, zoom, rect.width, rect.height));
  }
  function handlePointerUp() {
    dragOrigin.current = null;
    setIsDragging(false);
  }
  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    zoomAt(event.clientX, event.clientY, zoom * (1 + direction * WHEEL_ZOOM_STEP));
  }
  async function toggleFullscreen() {
    const board = boardRef.current;
    if (!board) return;
    try {
      if (document.fullscreenElement === board) await document.exitFullscreen();
      else await board.requestFullscreen?.();
    } catch {
      // Fullscreen API unavailable/denied — control stays a no-op, not an error.
    }
  }
  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  const sceneTransform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  return (
    // mm:2940:14170 (Frame 552)
    <section data-testid="spotlight-board" className="relative w-full">
      {/* mm:2940:14169 (Rectangle 60) */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#00101A]" />
      <div className="mx-auto flex w-full max-w-[1152px] flex-col items-start gap-8 px-4 py-16 sm:px-6 md:px-9 lg:px-12 xl:px-0">
        {/* mm:2940:13476 (B.6_Header Giải thưởng) */}
        <div className="flex w-full flex-col items-start gap-4">
          {/* mm:2940:13477 */}
          <p className="text-2xl leading-8 font-bold text-white">{labels.eyebrow}</p>
          {/* mm:2940:13478 */}
          <div className="h-px w-full bg-[#2E3940]" />
          {/* mm:2940:13480 */}
          <h2 className="text-[34px] leading-10 font-bold tracking-[-0.25px] text-[#FFEA9E] sm:text-[44px] sm:leading-[52px] lg:text-[57px] lg:leading-[64px]">
            {labels.heading}
          </h2>
        </div>

        {/* mm:2940:14174 (B.7_Spotlight) */}
        <div
          ref={boardRef}
          style={{ containerType: "inline-size" }}
          className={`relative aspect-[1157/548] w-full touch-none overflow-hidden rounded-[clamp(20px,4vw,47.14px)] border border-[#998C5F] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* mm:2940:14178/14181/14173 — background artwork behind the cloud */}
          <div
            aria-hidden
            className="absolute inset-0 origin-center bg-cover bg-center"
            style={{ backgroundImage: "url(/kudos/kv-background.png)", transform: sceneTransform }}
          />
          {/* mm:2940:14174 name cloud — pans/zooms with the artwork */}
          <div className="absolute inset-0 origin-center" style={{ transform: sceneTransform }}>
            <SpotlightCloud names={names} searchQuery={searchQuery} />
          </div>
          {/* mm:3007:17482 (B.7.1_388 KUDOS) — fixed HUD, does not pan/zoom */}
          <div className="pointer-events-none absolute top-[2.6%] left-1/2 -translate-x-1/2 text-center text-[28px] leading-[34px] font-bold text-white sm:text-[36px] sm:leading-[44px]">
            {totalKudos} {labels.kudosSuffix}
          </div>
          {/* mm:2940:14833 (B.7.3_Tìm kiếm sunner) */}
          <label className="absolute top-[4.7%] left-[2.2%] flex items-center gap-[5px] rounded-[46px] border border-[#998C5F] bg-[#FFEA9E]/10 px-[11px] py-[14px]">
            <MaskedIcon src="/kudos/icon-search.svg" size={16} className="text-white" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="w-20 bg-transparent text-[11px] leading-4 font-medium tracking-[0.1px] text-white placeholder-white/70 focus:outline-none sm:w-32"
            />
          </label>
          {/* mm:3004:15995..15999 + mm:2940:14230 — live ticker */}
          <div className="absolute bottom-[3.6%] left-[4.2%] w-[48%] min-w-[160px]">
            <SpotlightTicker activity={activity} activitySuffix={labels.activitySuffix} />
          </div>
          {/* mm:3007:17479 (B.7.2_Pan zoom) — Figma ships no icon glyphs, so paths are authored inline */}
          <div className="absolute right-[3.3%] bottom-[8.6%] flex items-center gap-2">
            <ControlButton d="M12 7A5 5 0 1 1 10.2 3.2M12 1v3.5H8.5" label="Reset view" onClick={resetView} />
            <ControlButton d="M1 7h12" label="Zoom out" onClick={() => zoomAtCenter(zoom * 0.8)} />
            <ControlButton d="M7 1v12M1 7h12" label="Zoom in" onClick={() => zoomAtCenter(zoom * 1.25)} />
            <ControlButton
              d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"
              label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ControlButton({ d, label, onClick }: { d: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#998C5F] bg-[#FFEA9E]/10 text-white transition-colors duration-150 ease-out hover:bg-[#FFEA9E]/20 motion-reduce:transition-none"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
