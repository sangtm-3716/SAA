import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE, normalizeLocale } from "./locale";

/**
 * Cookie-based ("no i18n routing") locale resolution. There is deliberately
 * no app/[locale] segment and no Accept-Language negotiation — see
 * plan.md -> "Architecture decisions" for why: Playwright's Desktop Chrome
 * sends Accept-Language: en-US, which would otherwise resolve a first visit
 * to English and fail the Vietnamese-default test cases.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
