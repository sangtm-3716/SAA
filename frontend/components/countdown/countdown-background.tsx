/**
 * Full-bleed background behind the countdown content.
 *
 * mm:2268:35129 (MM_MEDIA_BG Image) — real raster asset, exported
 * successfully via `get_media_files` (unlike the login hero key-visual,
 * which returned HTTP 500 three times with no media URL). Saved to
 * `public/countdown/bg-image.png`.
 *
 * mm:2268:35130 (Cover) — a diagonal dark gradient overlay on top of the
 * artwork, taken verbatim from the node's `background` style.
 */
export function CountdownBackground() {
  return (
    <div
      data-testid="countdown-background"
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#00101A]"
    >
      {/* mm:2268:35129 */}
      {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed decorative background, no responsive variants needed */}
      <img
        src="/countdown/bg-image.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* mm:2268:35130 */}
      <div className="absolute inset-0 bg-[linear-gradient(18deg,#00101A_15.48%,rgba(0,18,29,0.46)_52.13%,rgba(0,19,32,0)_63.41%)]" />
    </div>
  );
}
