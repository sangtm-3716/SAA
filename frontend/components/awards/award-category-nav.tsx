"use client";

import { useEffect, useState } from "react";
import type { AwardCategory } from "@/lib/awards/award-categories";
import { MaskedIcon } from "./masked-icon";

/**
 * mm:313:8459 (mms_C_Menu list)
 *
 * Left-hand category menu. Spec C says the active item is gold with an
 * underline indicator and that clicking one smooth-scrolls to its award
 * card, so this is the screen's only interactive region and the only
 * client component on the page.
 *
 * Active state is derived from scroll position rather than from the click,
 * so scrolling the page by any means keeps the menu honest. The observer
 * uses a top-biased root margin: a card counts as "current" once its top
 * passes under the sticky header, which is what a reader perceives as the
 * section they are in. Without it the browser would favour whichever card
 * happens to be tallest on screen.
 */
const HEADER_OFFSET = 96;

export function AwardCategoryNav({
  categories,
}: {
  categories: AwardCategory[];
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id);

  useEffect(() => {
    const sections = categories
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`, threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories]);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const target = document.getElementById(id);
    if (!target) return; // let the browser fall back to the plain anchor

    event.preventDefault();
    setActiveId(id);
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
      behavior: "smooth",
    });
  };

  return (
    <nav
      data-testid="award-category-nav"
      aria-label="Danh mục giải thưởng"
      className="flex shrink-0 gap-2 overflow-x-auto lg:sticky lg:top-24 lg:w-[178px] lg:flex-col lg:gap-4 lg:overflow-visible"
    >
      {categories.map(({ id, navLabel }) => {
        const isActive = id === activeId;
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={(event) => handleClick(event, id)}
            aria-current={isActive ? "true" : undefined}
            // 14px/20px, letter-spacing .25px (mm:I313:8460;186:1502 and
            // siblings). The active item adds the gold glow its Figma node
            // carries as a text-shadow, not just the colour swap.
            className={`flex shrink-0 items-center gap-1 rounded p-4 text-sm leading-5 font-bold tracking-[0.25px] whitespace-nowrap lg:whitespace-normal ${
              isActive
                ? "border-b border-[#FFEA9E] text-[#FFEA9E]"
                : "text-white hover:text-[#FFEA9E]"
            }`}
            style={
              isActive
                ? { textShadow: "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287" }
                : undefined
            }
          >
            {/* Every item carries the target glyph (mm:I313:8460;186:1745
                and siblings), tinted by the link's own colour. */}
            <MaskedIcon src="/awards/icon-target.svg" />
            {navLabel}
          </a>
        );
      })}
    </nav>
  );
}
