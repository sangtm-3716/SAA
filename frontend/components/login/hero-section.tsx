"use client";

import { useTranslations } from "next-intl";
import { signInWithGoogle } from "@/lib/auth/sign-in-with-google";
import { GoogleLoginButton } from "./google-login-button";
import { LoginError } from "./login-error";

/**
 * mm:662:14393 (mms_B_Bìa)
 *
 * The design has no separate wordmark text layer — the brand name is baked
 * into the `MM_MEDIA_Root Further Logo` raster asset (node 2939:9548), which
 * also doubles as the "key visual" test case references. To satisfy the
 * binding contract (`hero-title` must contain the wordmark, see
 * `login.heroTitle` in the message catalogs) without duplicating the
 * wordmark visually, the translated text is kept as an sr-only node next to
 * the visible image.
 *
 * Client component: it owns the real `signInWithGoogle` wiring for the
 * button (a plain function reference can only cross the server/client
 * boundary as a prop from within client code) and reads its own strings via
 * `useTranslations` per the phase-07 contract, instead of prop-drilling
 * every catalog key down from `app/login/page.tsx`.
 */
export function HeroSection({ errorMessage }: { errorMessage?: string }) {
  const t = useTranslations("login");

  return (
    // mm:662:14394 (Frame 487)
    <section className="relative z-10 flex flex-1 flex-col items-start justify-center gap-10 px-4 py-10 sm:px-6 md:px-9 md:py-16 lg:gap-16 lg:px-12 lg:py-20 xl:px-16">
      {/* mm:662:14395 (mms_B.1_Key Visual) */}
      <div data-testid="hero-title" className="flex max-w-[451px] flex-col">
        <span className="sr-only">{t("heroTitle")}</span>
        {/* mm:2939:9548 (MM_MEDIA_Root Further Logo) */}
        <img
          data-testid="hero-key-visual"
          src="/login/root-further-logo.png"
          alt={t("heroTitle")}
          width={451}
          height={200}
          className="h-auto w-full max-w-[451px]"
        />
      </div>

      {/* mm:662:14755 (Frame 550) */}
      <div className="flex max-w-[480px] flex-col items-start gap-6">
        {/* mm:662:14753 (mms_B.2_content) */}
        <div className="flex flex-col gap-2 text-lg leading-9 tracking-[0.5px] text-white sm:text-xl sm:leading-10">
          <p data-testid="hero-subtitle">{t("heroSubtitle")}</p>
          <p data-testid="hero-tagline">{t("heroTagline")}</p>
        </div>

        {/* mm:662:14425 (mms_B.3_Login) */}
        <GoogleLoginButton onSignIn={signInWithGoogle} label={t("googleButton")} />
        <LoginError message={errorMessage} />
      </div>
    </section>
  );
}
