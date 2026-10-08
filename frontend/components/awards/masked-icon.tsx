/**
 * Renders one of the exported Figma glyphs in an arbitrary colour.
 *
 * The `MM_MEDIA_*` icons come out of Figma as SVGs with a hard-coded
 * `fill="white"`, but the design tints several of them gold (#FFEA9E) where
 * they sit beside a gold heading. Loading them through `<img>` would lock in
 * the white fill, and inlining six icon paths by hand would duplicate assets
 * that already exist on disk. A CSS mask keeps the single downloaded file as
 * the source of truth for the shape while `currentColor` supplies the ink.
 */
export function MaskedIcon({
  src,
  size = 24,
  className = "",
}: {
  src: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
