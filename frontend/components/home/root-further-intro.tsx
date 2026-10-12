import {
  ROOT_FURTHER_INTRO,
  ROOT_FURTHER_OUTRO,
  ROOT_FURTHER_QUOTE,
} from "@/lib/home/root-further-copy";

/**
 * mm:3204:10152 (Frame 486) — the "Root Further" theme essay section of the
 * Homepage SAA screen, sitting inside the hero ("Bìa", mm:2167:9030).
 *
 * At the 1512px design width this 1152px-wide content frame centers inside
 * its 1512px parent (`alignItems: center`, 180px of symmetric slack either
 * side), so it renders as a `max-w-[1152px] mx-auto` container rather than a
 * fixed-width block — see code-rules.md "Containered layout".
 *
 * The keyvisual/Cover gradient behind this section belongs to the page root
 * (see `HomeBackground`) — this component renders text content only.
 *
 * Both essay paragraphs (mm:3204:10156, mm:3204:10162) report
 * `backgroundColor: rgba(255,255,255,1)` in the node tree, which is the
 * MoMorph extractor's way of surfacing a TEXT node's fill on a dark
 * background; the pull-quote (mm:3204:10161) confirms the same white ink
 * explicitly via `color: var(--Details-Text-Secondary-1, #FFF)`. All three
 * render in that white.
 */
export function RootFurtherIntro() {
  return (
    <section
      data-testid="root-further-intro"
      className="relative w-full"
    >
      {/* mm:3204:10152 (Frame 486) */}
      {/* Frame 486 declares `padding: 120px 104px`, but NONE of it is live in
          the design: its children are absolutely positioned and ignore it in
          both axes. Horizontally mms_B4_content spans the frame's full 1152px
          (startX 180 → endX 1332); vertically the wordmark starts at y=881,
          18px ABOVE the frame's own y=899, and the essay runs to y=2137,
          past the frame's y=2118 end. Reproducing that padding would narrow
          the essay to 944px and push this whole section 240px down the page.
          Only the frame's 32px gap is real. The gutters below are a
          mobile-only fallback and collapse to 0 at xl, where the 1152px
          max-width governs exactly as in Figma. */}
      <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center justify-center gap-8 rounded-lg px-4 sm:px-6 md:px-9 lg:px-12 xl:px-0">
        {/* mm:3204:10153 (Group 434) — stacked two-line wordmark */}
        <div className="flex w-[290px] max-w-full flex-col items-center">
          <h2 className="sr-only">Root Further</h2>
          {/* mm:3204:10155 (MM_MEDIA_Root Text) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio wordmark glyph, no responsive variants needed */}
          <img
            src="/home/root-text.png"
            alt=""
            aria-hidden
            width={189}
            height={67}
            className="h-auto w-[189px] max-w-full"
          />
          {/* mm:3204:10154 (MM_MEDIA_Further Text) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-ratio wordmark glyph, no responsive variants needed */}
          <img
            src="/home/further-text.png"
            alt=""
            aria-hidden
            width={290}
            height={67}
            className="h-auto w-[290px] max-w-full"
          />
        </div>

        {/* mm:5001:14827 (mms_B4_content) */}
        <div className="flex w-full flex-col gap-8 text-white">
          {/* mm:3204:10156 — 24px/32px bold, justified */}
          <p className="text-justify text-lg leading-8 font-bold whitespace-pre-line sm:text-xl lg:text-2xl">
            {ROOT_FURTHER_INTRO}
          </p>
          {/* mm:3204:10161 — 20px/32px bold, centred pull-quote */}
          <p className="text-center text-base leading-8 font-bold whitespace-pre-line sm:text-lg lg:text-xl">
            {ROOT_FURTHER_QUOTE}
          </p>
          {/* mm:3204:10162 — 24px/32px bold, justified */}
          <p className="text-justify text-lg leading-8 font-bold whitespace-pre-line sm:text-xl lg:text-2xl">
            {ROOT_FURTHER_OUTRO}
          </p>
        </div>
      </div>
    </section>
  );
}
