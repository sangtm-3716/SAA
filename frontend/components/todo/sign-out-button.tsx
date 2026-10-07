"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Posts to the server-side sign-out route and follows its redirect. A plain
 * form submission (not fetch) is used so the 303 redirect response is
 * followed natively by the browser, landing the user on /login with a real
 * navigation rather than requiring client-side router plumbing.
 */
export function SignOutButton() {
  const t = useTranslations("todo");
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <form
      action="/auth/sign-out"
      method="POST"
      onSubmit={() => setIsSigningOut(true)}
    >
      <button
        type="submit"
        data-testid="sign-out-button"
        disabled={isSigningOut}
        className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t("signOut")}
      </button>
    </form>
  );
}
