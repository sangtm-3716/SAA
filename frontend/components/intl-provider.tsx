import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

/**
 * Async server component that reads the resolved locale + message catalog
 * and hands them to the client provider. Must be wrapped in <Suspense> by
 * its caller (app/layout.tsx) — getLocale()/getMessages() read the
 * NEXT_LOCALE cookie under the hood, which is dynamic request data and
 * cannot be accessed with cacheComponents: true unless a Suspense boundary
 * sits above it.
 */
export async function IntlProvider({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
