export const LOCALE_COOKIE = "NEXT_LOCALE";

export const SUPPORTED_LOCALES = ["vi", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

/**
 * Narrows an arbitrary cookie value (or undefined) down to a supported
 * Locale, falling back to the default. Never throws — the locale read
 * happens on every request path and must tolerate an absent or garbage
 * cookie value.
 */
export function normalizeLocale(value?: string): Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value ?? "")
    ? (value as Locale)
    : DEFAULT_LOCALE;
}
