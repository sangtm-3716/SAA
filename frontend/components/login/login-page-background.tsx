/**
 * Full-bleed background layers behind the header/hero/footer content.
 *
 * mm:662:14389 (image 1, inside mms_C_Keyvisual) — this raster artwork is
 * NOT a Figma media asset (`get_media_files` has no URL for it) and
 * `get_figma_image` returns HTTP 500 for the node. Fallback: reuse the
 * countdown key visual (same ribbon artwork, different crop), framed by eye
 * to approximate the login design. Known deviation from pixel-perfect: the
 * crop and brightness differ slightly from the Figma frame.
 */
export function LoginPageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#00101A]"
    >
      {/* mm:662:14389 — countdown artwork fallback, see note above */}
      <div className="absolute inset-0 bg-[url(/countdown/bg-image.png)] bg-[length:130%_auto] bg-[position:40%_90%] bg-no-repeat" />
      {/* mm:662:14392 (Rectangle 57) */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#00101A_0%,#00101A_25.41%,rgba(0,16,26,0)_100%)]" />
      {/* mm:662:14390 (Cover) */}
      <div className="absolute inset-x-0 top-[138px] h-[1093px] bg-[linear-gradient(0deg,#00101A_22.48%,rgba(0,19,32,0)_51.74%)]" />
    </div>
  );
}
