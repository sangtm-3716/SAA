/**
 * mm:313:8437 (mms_3_Keyvisual) + mm:313:8453 (mms_A_Title hệ thống giải thưởng)
 *
 * The two are rendered together because they overlap in the design: the
 * key visual spans y 80–627 on the 1440px canvas while the title block sits
 * at y 454–583, i.e. over the key visual's faded lower third. Splitting them
 * into sibling components would mean coordinating absolute offsets across
 * files; a single flex column reproduces the same picture and survives a
 * narrow viewport.
 *
 * Asset note: in Figma the key visual is one flattened raster (`image 20`,
 * node 2167:5138) with the ROOT FURTHER wordmark baked in. That node is not
 * an `MM_MEDIA_*` layer, so `get_media_files` exposes no download URL for
 * it. It is recomposed here from the two assets the repo already holds —
 * `/countdown/bg-image.png` is the identical swirl artwork and
 * `/login/root-further-logo.png` is the wordmark — rather than approximated
 * with a gradient.
 */
export function AwardsHero({
  subtitle,
  title,
  wordmarkAlt,
}: {
  subtitle: string;
  title: string;
  wordmarkAlt: string;
}) {
  return (
    <section
      data-testid="awards-hero"
      className="relative flex min-h-[420px] w-full flex-col justify-between overflow-hidden sm:min-h-[480px] xl:h-[547px]"
    >
      {/* mm:2167:5138 (image 20) — artwork layer.
          The page root paints #00101A, so these layers must stack at z-0 and
          the content above them; a negative z-index would drop the artwork
          behind the page background and render the band flat black. */}
      <img
        src="/countdown/bg-image.png"
        alt=""
        aria-hidden
        // Crop to the artwork's upper band: that is where the navy field sits
        // under the wordmark and the swirl sweeps in from the right, which is
        // the composition the flattened Figma raster shows.
        className="absolute inset-0 z-0 size-full object-cover object-[50%_12%]"
      />
      {/* Fade into the page background so the title block stays legible.
          Mirrors the `Cover` gradient used on the login key visual. */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-[linear-gradient(0deg,#00101A_12%,rgba(0,16,26,0.55)_46%,rgba(0,16,26,0)_80%)]"
      />

      {/* The wordmark baked into the Figma raster, restored as its own layer */}
      <img
        src="/login/root-further-logo.png"
        alt={wordmarkAlt}
        width={451}
        height={200}
        className="relative z-10 mt-10 ml-4 w-[220px] max-w-[70%] sm:ml-6 sm:w-[280px] md:ml-9 md:w-[340px] lg:ml-12 lg:w-[400px] xl:ml-16"
      />

      {/* mm:313:8453 (mms_A_Title hệ thống giải thưởng) */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1152px] flex-col gap-4 px-4 pb-6 sm:px-6 md:px-9 lg:px-12 xl:px-0">
        {/* mm:313:8454 — 24px/32px, centred, white */}
        <p className="text-center text-2xl leading-8 font-bold text-white">
          {subtitle}
        </p>
        {/* mm:313:8455 (Rectangle 26) */}
        <div className="h-px w-full bg-[#2E3940]" />
        {/* mm:313:8456 / 313:8457 — 57px/64px, -0.25px, gold */}
        <h1 className="text-center text-3xl leading-tight font-bold tracking-[-0.25px] text-[#FFEA9E] sm:text-4xl md:text-5xl xl:text-[57px] xl:leading-16">
          {title}
        </h1>
      </div>
    </section>
  );
}
