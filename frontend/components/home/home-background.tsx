/**
 * Full-bleed key visual behind the homepage hero.
 *
 * mm:2167:9027 (mms_3.5_Keyvisual) — a 1512x1392 group holding the single
 * raster asset mm:2167:9028 (MM_MEDIA_Keyvisual BG), pinned to the top of
 * the 1512x4480 artboard.
 *
 * mm:2167:9029 (Cover) — a 1512x1480 diagonal wash sitting ON TOP of the
 * artwork, taken verbatim from the node's `background` style. It is 88px
 * TALLER than the artwork on purpose: the extra band fades the image into
 * the page's flat `#00101A` body so there is no visible seam where the
 * key visual ends.
 *
 * Deliberately `absolute`, not `fixed` like the countdown screen's
 * `CountdownBackground`: this artwork belongs to the top of the document
 * and must scroll away, whereas the countdown page is a single
 * non-scrolling viewport.
 *
 * The height is expressed as a viewport-relative aspect ratio rather than
 * the literal 1392px so the artwork keeps its framing on narrow screens —
 * at the 1512px design width the two resolve to the same thing.
 */
export function HomeBackground() {
  return (
    <div
      data-testid="home-background"
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[1480px] max-h-[200vh] overflow-hidden"
    >
      {/* mm:2167:9028 (MM_MEDIA_Keyvisual BG) — 1512x1392 */}
      {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed decorative key visual, no responsive variants needed */}
      <img
        src="/home/keyvisual-bg.png"
        alt=""
        className="absolute inset-x-0 top-0 h-[1392px] max-h-[188vh] w-full object-cover object-top"
      />
      {/* mm:2167:9029 (Cover) */}
      <div className="absolute inset-0 bg-[linear-gradient(12deg,#00101A_23.7%,rgba(0,18,29,0.46)_38.34%,rgba(0,19,32,0)_48.92%)]" />
    </div>
  );
}
