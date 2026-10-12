/**
 * Decides whether a URL found inside user-authored content may be rendered as
 * a real link.
 *
 * Kudo messages are written by one Sunner and read by everyone, and the
 * compose toolbar's link button (mm:I520:11647;662:10507) puts an arbitrary
 * string in the href slot. Rendering that verbatim would make
 * `[click me](javascript:fetch('/api',{method:'POST'}))` a working script
 * injection on the public board — React escapes element *text*, but it does
 * not vet an `href`.
 *
 * Allow-list, never a block-list: new dangerous schemes appear (`vbscript:`,
 * `data:text/html`, …) and a block-list is always one entry behind.
 */
const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Returns the absolute URL when it is safe to link to, or `null` when the
 * caller should render the text inert.
 *
 * The base makes relative paths resolvable so they can be judged by protocol
 * like anything else; it is a deliberately unroutable host so a bare
 * `/kudos` in a message can never be mistaken for a real destination.
 */
export function safeHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, "https://example.invalid");
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
