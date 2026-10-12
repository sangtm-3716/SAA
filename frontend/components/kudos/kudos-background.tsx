/**
 * Key visual behind the Kudos live-board hero — mm:2940:13432 (Keyvisual
 * instance), inside "Sun* Kudos - Live board" (mm:2940:13431).
 *
 * mm:I2940:13432;2167:5141 (MM_MEDIA_KV Background) is a 1440x512 rectangle
 * whose fill is NOT a plain top-aligned cover: Figma's computed style is
 * `background: url(...) -0.163px -909.862px / 101.245% 393.038% no-repeat`,
 * i.e. the source art is scaled far past 100% and panned so only a specific
 * crop shows inside the 1440x512 box. `background-size` is already
 * percentage-based (so it scales with a fluid container), but the position
 * was expressed in design-width pixels — fixing those as raw px would only
 * be correct at the literal 1440px artboard. They are converted here to
 * percentages with the CSS background-position formula
 * `offset / (container * (1 - size/100))`, which is scale-invariant and
 * reproduces the exact same crop at any container width:
 *   x: -0.163 / (1440 * (1 - 1.01245)) * 100  ≈ 0.91%
 *   y: -909.862 / (512 * (1 - 3.93038)) * 100 ≈ 60.64%
 *
 * mm:I2940:13432;1210:12612 (Cover) is the gradient wash, taken verbatim
 * from the node's `background`. In Figma-canvas coordinates it starts at
 * y:445 (within the 512-tall Keyvisual) and runs 957px tall down to y:1402,
 * bleeding the gradient past the banner into the page body below so the
 * artwork fades into the flat `#00101A` background rather than cutting off.
 * Those two figures are likewise expressed as percentages of the artwork's
 * own box (top: 445/512, height: 957/512) so the whole thing scales
 * together as one unit instead of just the Keyvisual's own fixed height.
 */
export function KudosBackground() {
  return (
    <div
      data-testid="kudos-background"
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full aspect-[45/16] overflow-visible"
    >
      {/* mm:I2940:13432;2167:5140 (Keyvisual) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* mm:I2940:13432;2167:5141 (MM_MEDIA_KV Background)
            The exported asset is 1440x512 — EXACTLY the node's own size, i.e.
            it is already the rendered crop, not the oversized source art.
            Figma's `background-position: -0.163px -909.862px / 101.245%
            393.038%` describes how the source was framed to PRODUCE this
            export; re-applying it here cropped an already-cropped image a
            second time and landed on a bright patch of the artwork, which is
            why the hero copy lost its dark backdrop. Drawn 1:1 instead. */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/kudos/kv-background.png)" }}
        />
      </div>
      {/* mm:I2940:13432;1210:12612 (Cover) */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "86.91%",
          height: "186.91%",
          background:
            "linear-gradient(25deg, #00101A 14.74%, rgba(0, 19, 32, 0.00) 47.8%)",
        }}
      />
    </div>
  );
}
