import Link from "next/link";
import type { Locale } from "@/i18n/locale";
import { setLocale } from "@/i18n/set-locale-action";
import { LanguageSelector } from "@/components/login/language-selector";
import { MaskedIcon } from "./masked-icon";

/**
 * mm:313:8440 (Header)
 *
 * Richer than the login screen's header (`components/login/login-header`):
 * this one carries the three top-level nav links, a notification bell with
 * an unread dot, and a profile button. Horizontal padding ramps to the
 * literal Figma gutter (144px on the 1440px canvas) at `xl` and stays fluid
 * below so nothing overflows on a phone.
 *
 * The nav links are English in the Vietnamese design, so they are not run
 * through the message catalogues — there is nothing to translate.
 */
const NAV_LINKS = [
  // mm:I313:8440;186:1579 — 16px/24px, letter-spacing .15px
  { href: "/about", label: "About SAA 2025", small: false },
  // mm:I313:8440;186:1587 — active: gold + 1px bottom rule + glow
  { href: "/awards", label: "Award Information", small: false },
  // mm:I313:8440;186:1593 — 14px/20px, letter-spacing .1px
  { href: "/kudos", label: "Sun* Kudos", small: true },
];

const GOLD_GLOW = "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287";

export function SiteHeader({
  locale,
  activeHref,
}: {
  locale: Locale;
  activeHref?: string;
}) {
  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-30 flex h-20 w-full items-center justify-between gap-6 bg-[rgba(16,20,23,0.8)] px-4 py-3 backdrop-blur-sm sm:px-6 md:px-9 lg:px-12 xl:px-36"
    >
      {/* mm:I313:8440;186:2166 (Frame 488) */}
      <div className="flex items-center gap-6 lg:gap-10 xl:gap-16">
        {/* mm:I313:8440;178:1033 (LOGO) */}
        <Link href="/" className="shrink-0" aria-label="Sun* Annual Awards 2025">
          <img
            src="/login/logo.png"
            alt=""
            width={52}
            height={48}
            className="h-12 w-[52px] object-contain"
          />
        </Link>

        {/* mm:I313:8440;178:653 (Frame 476) */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label, small }) => {
            const isActive = href === activeHref;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center rounded p-4 text-center font-bold ${
                  small
                    ? "text-sm leading-5 tracking-[0.1px]"
                    : "text-base leading-6 tracking-[0.15px]"
                } ${
                  isActive
                    ? "border-b border-[#FFEA9E] text-[#FFEA9E]"
                    : "text-white hover:text-[#FFEA9E]"
                }`}
                style={isActive ? { textShadow: GOLD_GLOW } : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* mm:I313:8440;186:1601 (Frame 482) */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* mm:I313:8440;186:2101 (Notification) */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded p-2.5 text-white"
        >
          <MaskedIcon src="/awards/icon-bell.svg" />
          {/* mm:I313:8440;186:2101;186:2089 (Badge/Dot) */}
          <span className="absolute right-[9px] top-[9px] size-2 rounded-full bg-[#E5484D]" />
        </button>

        <LanguageSelector locale={locale} onSelect={setLocale} />

        {/* mm:I313:8440;186:1597 (Button-IC — profile) */}
        <button
          type="button"
          aria-label="Account"
          className="flex size-10 items-center justify-center rounded border border-[#998C5F] p-2.5 text-white"
        >
          <MaskedIcon src="/awards/icon-user.svg" />
        </button>
      </div>
    </header>
  );
}
