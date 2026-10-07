/**
 * Full-bleed background layers behind the header/hero/footer content.
 *
 * mm:662:14389 (image 1, inside mms_C_Keyvisual) — this raster background
 * artwork is NOT a Figma asset (its node name is "image 1", not
 * `mm_media_*`), so `get_media_files` has no download URL for it. Per
 * clarifications.md ("Hero key-visual asset ... fallback is a CSS gradient
 * only if the asset cannot be exported"), it is approximated here with a
 * brand-toned radial gradient instead of the real artwork. This is a known,
 * plainly-reported deviation from pixel-perfect fidelity for this one layer.
 */
export function LoginPageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#00101A]"
    >
      {/* mm:662:14389 — CSS-gradient fallback, see note above */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_80%_0%,#123042_0%,#00101A_55%,#00101A_100%)]" />
      {/* mm:662:14392 (Rectangle 57) */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#00101A_0%,#00101A_25.41%,rgba(0,16,26,0)_100%)]" />
      {/* mm:662:14390 (Cover) */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#00101A_22.48%,rgba(0,19,32,0)_51.74%)]" />
    </div>
  );
}
