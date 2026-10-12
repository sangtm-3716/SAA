"use client";

import { useEffect } from "react";

/**
 * Scrolls to the `#<postId>` in the URL once that card actually exists.
 *
 * The browser's own hash scrolling cannot do this here. `/kudos` streams its
 * three sections through separate `<Suspense>` boundaries, so at the moment
 * the router finishes navigating, the ALL KUDOS feed has not rendered and the
 * element the hash names is not in the document yet. The browser looks, finds
 * nothing, and gives up — the page stays at the top.
 *
 * That is what made a successful post look like a failed one: the compose
 * action redirects to `/kudos#<id>`, the author's new Kudo is the first card
 * in ALL KUDOS, and ALL KUDOS begins ~2500px down. Landing at y=0 shows no
 * trace of what they just wrote.
 *
 * So this waits. A `MutationObserver` watches for the node to appear and
 * scrolls to it, giving up after `TIMEOUT_MS` rather than observing forever —
 * a hash naming a post that has fallen off the first page of the feed will
 * never resolve, and that must not leak an observer.
 *
 * Also covers the Copy Link button, which has always produced `/kudos#<id>`
 * links that silently failed to scroll for the same reason.
 *
 * ## Why the highlight is animated from JavaScript
 *
 * Landing mid-feed among eight near-identical cream cards still leaves the
 * author hunting for their own, so the target card is ringed briefly. Two
 * tidier-looking routes were tried first and both failed:
 *
 *   - `classList.add(...)` — the card is React-rendered, and the next render
 *     overwrites a `className` React did not author. The ring silently never
 *     appeared.
 *   - an `article:target` rule in `app/globals.css` — never reached the
 *     served bundle, and `:target` does not engage after a client-side
 *     navigation anyway, which is exactly how the compose redirect arrives.
 *
 * The Web Animations API sidesteps both: it runs on the element's own
 * animation timeline rather than through an attribute React reconciles, and
 * it needs nothing from the CSS build. It also cleans up after itself — the
 * default `fill: "none"` leaves no residue once the ring has faded.
 */

const TIMEOUT_MS = 10_000;
const HIGHLIGHT_MS = 2_400;
const RING = "0 0 0 4px #FFEA9E, 0 0 0 8px #00101A";
const RING_FADED = "0 0 0 4px rgba(255, 234, 158, 0), 0 0 0 8px rgba(0, 16, 26, 0)";

export function ScrollToHash() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let fadeId: number | undefined;

    function reveal(element: Element) {
      element.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });

      if (reduceMotion) {
        // No fade, but still a marker — then cleared, so it never reads as
        // permanent state on the card.
        const node = element as HTMLElement;
        node.style.boxShadow = RING;
        fadeId = window.setTimeout(() => {
          node.style.boxShadow = "";
        }, HIGHLIGHT_MS);
        return;
      }

      element.animate(
        [
          { boxShadow: RING, offset: 0 },
          { boxShadow: RING, offset: 0.55 },
          { boxShadow: RING_FADED, offset: 1 },
        ],
        { duration: HIGHLIGHT_MS, easing: "ease-out" },
      );
    }

    // `CSS.escape` is required, not defensive: a post id is a UUID, and one
    // starting with a digit (`#31b203b9-…`) is an INVALID CSS selector that
    // makes `querySelector` throw. Roughly a third of UUIDs start with a
    // digit, so the unescaped version fails for a third of all posts.
    const selector = `#${CSS.escape(id)}`;

    const existing = document.querySelector(selector);
    if (existing) {
      reveal(existing);
      return () => window.clearTimeout(fadeId);
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (!element) return;
      // No need to clear the give-up timer: `disconnect` is idempotent, so
      // letting it fire later on an already-disconnected observer is a no-op.
      observer.disconnect();
      reveal(element);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    const timeoutId = window.setTimeout(() => observer.disconnect(), TIMEOUT_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
      window.clearTimeout(fadeId);
    };
  }, []);

  return null;
}
