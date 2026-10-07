"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, SUPPORTED_LOCALES, type Locale } from "./locale";

const ONE_YEAR_IN_SECONDS = 31536000;

/**
 * Persists the user's locale choice in a cookie. The value arrives from the
 * client, so it is validated against the supported-locale allowlist before
 * it ever reaches `cookies().set` — an unvalidated value here would also
 * flow into the dynamic `import()` in i18n/request.ts, a path-traversal
 * shape that must never be allowed to exist.
 */
export async function setLocale(locale: Locale): Promise<void> {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });
}
