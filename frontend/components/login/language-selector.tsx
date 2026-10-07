"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/locale";
import { IconChevronDown } from "./icon-chevron-down";

const LOCALE_CODE: Record<Locale, string> = {
  vi: "VN",
  en: "EN",
};

/**
 * mm:I662:14391;186:1601 (mms_A.2_Language)
 *
 * No open/expanded variant exists for this component in the MoMorph file
 * (query_component found only the collapsed "Language" instance used on this
 * screen) — the dropdown panel below is styled from the screen's own tokens
 * (header bg family, #2E3940 divider, white text) rather than a Figma spec.
 * Likewise the design ships only a Vietnam flag asset; the "en" option is
 * rendered as text only (no flag was fabricated for it).
 */
export function LanguageSelector({
  locale,
  onSelect,
}: {
  locale: Locale;
  onSelect?: (locale: Locale) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
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

  async function handleSelect(next: Locale) {
    setOpen(false);
    await onSelect?.(next);
    // Re-render the page in the new locale without leaving `/login` — the
    // locale cookie was just persisted by `onSelect` (the `setLocale`
    // Server Action); `router.refresh()` re-runs the RSC tree against it.
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      {/* mm:I662:14391;186:1696;186:1821 (Button) */}
      <button
        type="button"
        data-testid="language-selector"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-2 rounded px-4 py-4 text-white transition-colors duration-200 ease-out hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
      >
        {/* mm:I662:14391;186:1696;186:1821;186:1937 (Frame 485) */}
        <span className="flex items-center gap-1">
          {/* mm:I662:14391;186:1696;186:1821;186:1709 (MM_MEDIA_VN) */}
          <img
            data-testid="language-flag"
            src="/login/vn-flag.svg"
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
          className="h-6 w-6 shrink-0 text-white"
        />
      </button>

      {open && (
        <div
          data-testid="language-dropdown"
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-md border border-[#2E3940] bg-[#0B0F12] py-1 shadow-lg"
        >
          <button
            type="button"
            data-testid="language-option-vi"
            role="option"
            aria-selected={locale === "vi"}
            onClick={() => handleSelect("vi")}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-white transition-colors duration-150 ease-out hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
          >
            <img
              src="/login/vn-flag.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0"
            />
            Tiếng Việt
          </button>
          <button
            type="button"
            data-testid="language-option-en"
            role="option"
            aria-selected={locale === "en"}
            onClick={() => handleSelect("en")}
            className="flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm text-white transition-colors duration-150 ease-out hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}
