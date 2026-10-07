"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * mm:662:14426 (Button-IC About)
 * Client component — owns its own pending state only (no error state: see
 * LoginError, which phase-07 feeds independently from the OAuth redirect
 * result). `pending` is set synchronously on click, before awaiting
 * `onSignIn`, so the spinner/disabled state is visible for the whole call.
 */
export function GoogleLoginButton({
  onSignIn,
  label,
}: {
  onSignIn?: () => void | Promise<void>;
  label: string;
}) {
  const t = useTranslations("login");
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await onSignIn?.();
      // Deliberately do NOT clear `pending` on success. signInWithOAuth resolves
      // as soon as it has pointed window.location at Google, while the browser is
      // still redirecting. Clearing it here (the obvious `finally`) re-enables the
      // button and drops the spinner mid-hand-off, so the user sees no loading
      // state at all and can click again. Verified: with a `finally`, `disabled`
      // never becomes true in a real browser.
    } catch (error) {
      // Sign-in never started, so the page is not navigating away: restore the
      // button so the user can retry.
      setPending(false);
      throw error;
    }
  }

  return (
    <button
      type="button"
      data-testid="google-login-button"
      disabled={pending}
      onClick={handleClick}
      className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 py-4 text-lg leading-7 text-[#00101A] shadow-[0_0_0_rgba(0,0,0,0)] transition-shadow duration-200 ease-out hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none sm:text-[22px]"
    >
      <span>{label}</span>
      {/* mm:I662:14426;186:1766 (MM_MEDIA_Google) */}
      <img
        data-testid="google-icon"
        src="/login/google-icon.svg"
        alt=""
        width={24}
        height={24}
        className="h-6 w-6 shrink-0"
      />
      {pending && (
        <span
          data-testid="login-button-spinner"
          role="status"
          aria-label={t("spinnerLabel")}
          className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#00101A]/30 border-t-[#00101A] motion-reduce:animate-none"
        />
      )}
    </button>
  );
}
