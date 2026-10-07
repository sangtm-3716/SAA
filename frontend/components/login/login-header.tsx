import type { Locale } from "@/i18n/locale";
import { setLocale } from "@/i18n/set-locale-action";
import { LanguageSelector } from "./language-selector";

/**
 * mm:662:14391 (mms_A_Header)
 *
 * Horizontal padding ramps up to the literal Figma value (144px, fixed for
 * the 1440px canvas) at the `xl` breakpoint (>=1280px) and stays responsive
 * below it so nothing overflows on small viewports. The binding e2e spec
 * (phase-08) measures the language selector's gap from the viewport's
 * *right* edge, so a fixed 144px gutter at `xl` satisfies it at every tested
 * width (1280/1920) while the logo/selector stay anchored left/right.
 */
export function LoginHeader({ locale }: { locale: Locale }) {
  return (
    <header
      data-testid="login-header"
      className="sticky top-0 z-20 flex w-full items-center justify-between bg-[rgba(11,15,18,0.8)] px-4 py-3 backdrop-blur-sm sm:px-6 md:px-9 lg:px-12 xl:px-36"
    >
      {/* mm:I662:14391;186:2166 (mms_A.1_Logo) */}
      {/* mm:I662:14391;178:1033;178:1030 (MM_MEDIA_Logo) */}
      <img
        data-testid="brand-logo"
        src="/login/logo.png"
        alt="Sun Annual Awards 2025"
        width={52}
        height={48}
        className="h-12 w-[52px] object-contain"
      />
      <LanguageSelector locale={locale} onSelect={setLocale} />
    </header>
  );
}
