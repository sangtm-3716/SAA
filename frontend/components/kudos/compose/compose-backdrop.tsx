/**
 * Backdrop for the "Viết Kudo" compose screen — the three stacked layers
 * behind the modal card on mm:520:11602.
 *
 * Back to front:
 *   mm:520:11603 (Keyvisual)  — the circuit-board artwork band
 *   mm:520:11605 (Cover)      — gradient that sinks the band into the page
 *   mm:520:11646 (Mask)       — rgba(0,16,26,.8) veil over the whole frame
 *
 * The mask sits ABOVE the site header in the Figma stack (the header renders
 * visibly dimmed on the canvas), so this component is pinned `fixed` at a
 * z-index between the header and the card rather than scrolling with the
 * document: the compose card is taller than the 1024px artboard on narrow
 * viewports, and a document-flow mask would stop short of the fold and let
 * the raw `#00101A` page show through below it.
 *
 * mm:520:11607 ("Bìa", the Kudos page content the modal was opened on top of)
 * is deliberately not reproduced. It sits entirely behind the 80% mask and
 * contributes nothing the render shows — the design screenshot is a uniform
 * dark field there — so drawing it would cost a second copy of the Kudos
 * hero for zero visible pixels.
 *
 * The artwork is `/kudos/kv-background.png`, the same asset the parent
 * `/kudos` route uses (`KudosBackground`). The compose frame's own keyvisual
 * node is a plain RECTANGLE rather than an `MM_MEDIA_*` node, so MoMorph
 * exports no file for it; reusing the sibling screen's keyvisual keeps the
 * two routes visually continuous.
 */
export function ComposeBackdrop() {
  return (
    <div data-testid="compose-backdrop" aria-hidden className="pointer-events-none fixed inset-0 z-20">
      {/* mm:520:11603 (Keyvisual) — y 128→768 of the 1024px artboard, and
          1611px wide against a 1440px frame, so it bleeds off the right edge
          and is clipped here rather than squeezed to fit (111.875% = 1611/1440).

          mm:520:11604 ("image 1") carries Figma's own framing:
          `background: url(...) 0px -146.461px / 95.964% 143.103%` — the art is
          blown up to 143% vertically and panned up, which is what turns the
          full ribbon spread into the few large, soft curves the design shows.
          `bg-cover` showed the whole spread instead and read far busier. The
          pixel offset is converted to a percentage with the CSS
          background-position formula `offset / (box * (1 - size/100))`, which
          is scale-invariant and holds the same crop at any width:
            x: 0                                            → 0%
            y: -146.461 / (640 * (1 - 1.43103)) * 100       ≈ 53.09% */}
      <div className="absolute inset-x-0 top-[12.5%] h-[62.5%] overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full w-[111.875%] bg-no-repeat"
          style={{
            backgroundImage: "url(/kudos/kv-background.png)",
            backgroundSize: "95.964% 143.103%",
            backgroundPosition: "0% 53.09%",
          }}
        />
      </div>
      {/* mm:520:11605 (Cover) — y 0→512, i.e. the top half of the artboard. */}
      <div
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background: "linear-gradient(0deg, #00101A 25%, rgba(0, 19, 32, 0.00) 50%)",
        }}
      />
      {/* mm:520:11646 (Mask) */}
      <div className="absolute inset-0 bg-[#00101A]/80" />
    </div>
  );
}
