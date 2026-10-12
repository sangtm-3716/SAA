"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/locale";
import { IconChevronDown } from "./icon-chevron-down";

/**
 * mm:I662:14391;186:1601 (collapsed trigger) +
 * mm:721:4942 "Dropdown-ngôn ngữ" / mm:525:11713 (mms_A_Dropdown-List) — the
 * open panel, which now has its own MoMorph screen (hUyaaugye2). The panel
 * below is built from that spec, replacing the earlier improvised styling
 * that predated it.
 *
 * Both options carry a flag in the design (mm:…;178:1019 "VN - Vietnam",
 * mm:…;178:967 "GB-NIR"), and both are labelled with the short code — "VN"
 * and "EN" — not the language's own name.
 *
 * The selected row is the design's `mms_A.1` variant: a 20%-opacity gold
 * wash (`rgba(255,234,158,0.2)`) at a 2px radius. The unselected row
 * (`mms_A.2`) has no fill.
 */

/** mm:…;186:1439 — the label Figma prints inside each row and the trigger. */
const LOCALE_CODE: Record<Locale, string> = {
  vi: "VN",
  en: "EN",
};

/** Flag icon per locale. `vi` is the Figma export; `gb-flag` is authored to match. */
const LOCALE_FLAG: Record<Locale, string> = {
  vi: "/login/vn-flag.svg",
  en: "/login/gb-flag.svg",
};

export function LanguageSelector({
  locale,
  onSelect,
}: {
  locale: Locale;
  onSelect?: (locale: Locale) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Partial<Record<Locale, HTMLButtonElement | null>>>({});
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Opening moves focus into the list, at the row that is currently active —
  // without this a keyboard user would tab from the trigger straight past the
  // panel, since it is rendered after the button but visually below it.
  useEffect(() => {
    if (!open) return;
    optionRefs.current[locale]?.focus();
  }, [open, locale]);

  function close({ restoreFocus }: { restoreFocus: boolean }) {
    setOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  async function handleSelect(next: Locale) {
    close({ restoreFocus: true });
    await onSelect?.(next);
    // Re-render the current route in the new locale without navigating: the
    // locale cookie was just persisted by `onSelect` (the `setLocale` Server
    // Action), and `router.refresh()` re-runs the RSC tree against it. This
    // is what makes the switch work on every screen that mounts this
    // component, not just /login.
    router.refresh();
  }

  /**
   * Roving focus across the two rows. `ArrowDown`/`ArrowUp` wrap, `Home`/`End`
   * jump to the ends, `Escape` closes and hands focus back to the trigger —
   * the listbox behaviour a user pressing keys here reasonably expects.
   */
  function handleOptionKeyDown(event: React.KeyboardEvent, index: number) {
    const { key } = event;
    if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") {
      return;
    }
    event.preventDefault();
    const count = SUPPORTED_LOCALES.length;
    const nextIndex =
      key === "Home"
        ? 0
        : key === "End"
          ? count - 1
          : key === "ArrowDown"
            ? (index + 1) % count
            : (index - 1 + count) % count;
    optionRefs.current[SUPPORTED_LOCALES[nextIndex]]?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          close({ restoreFocus: true });
        }
      }}
    >
      {/* mm:I662:14391;186:1696;186:1821 (Button) */}
      <button
        ref={triggerRef}
        type="button"
        data-testid="language-selector"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${LOCALE_CODE[locale]}`}
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-2 rounded px-4 py-4 text-white transition-colors duration-200 ease-out hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
      >
        {/* mm:I662:14391;186:1696;186:1821;186:1937 (Frame 485) */}
        <span className="flex items-center gap-1">
          {/* mm:I662:14391;186:1696;186:1821;186:1709 — tracks the ACTIVE
              locale; it was previously pinned to the Vietnamese flag, so
              switching to EN left the wrong flag beside the "EN" label. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed 24px flag glyph, no responsive variants needed */}
          <img
            data-testid="language-flag"
            src={LOCALE_FLAG[locale]}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
          {/* mm:I662:14391;186:1696;186:1821;186:1439 */}
          <span className="text-base leading-6 tracking-[0.15px]">
            {LOCALE_CODE[locale]}
          </span>
        </span>
        {/* mm:I662:14391;186:1696;186:1821;186:1441 (MM_MEDIA_Down) */}
        <IconChevronDown
          data-testid="language-chevron"
          className={`h-6 w-6 shrink-0 text-white transition-transform duration-200 ease-out motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        // mm:525:11713 (mms_A_Dropdown-List) — 1px #998C5F border, #00070C
        // fill, 6px padding, 8px radius.
        <div
          data-testid="language-dropdown"
          role="listbox"
          aria-label="Language"
          className="absolute right-0 z-30 mt-2 flex min-w-[122px] flex-col rounded-lg border border-[#998C5F] bg-[#00070C] p-1.5 shadow-lg"
        >
          {SUPPORTED_LOCALES.map((option, index) => {
            const isActive = option === locale;
            return (
              // mm:I525:11713;362:6085 (selected) / mm:I525:11713;362:6128
              <button
                key={option}
                ref={(node) => {
                  optionRefs.current[option] = node;
                }}
                type="button"
                data-testid={`language-option-${option}`}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(option)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                className={`flex h-14 w-full cursor-pointer items-center gap-1 rounded-sm p-4 text-left text-white transition-colors duration-150 ease-out hover:bg-[#FFEA9E]/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none ${
                  isActive ? "bg-[#FFEA9E]/20" : ""
                }`}
              >
                {/* mm:…;186:1709 (IC) — 24x24 flag */}
                {/* eslint-disable-next-line @next/next/no-img-element -- fixed 24px flag glyph, no responsive variants needed */}
                <img
                  src={LOCALE_FLAG[option]}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0"
                />
                {/* mm:…;186:1439 — 16px/24px, weight 700, letter-spacing .15px */}
                <span className="text-base leading-6 font-bold tracking-[0.15px]">
                  {LOCALE_CODE[option]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
