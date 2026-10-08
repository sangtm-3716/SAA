import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { CountdownBackground } from "@/components/countdown/countdown-background";
import { CountdownTicker } from "@/components/countdown/countdown-ticker";
import { computeCountdown } from "@/lib/countdown/compute-countdown";
import { getEventStartsAt } from "@/lib/event/event-settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("countdown");
  return { title: `SAA 2025 – ${t("metaTitle")}` };
}

// mm:2268:35127 (Countdown - Prelaunch page)
export default async function CountdownPage() {
  // `getEventStartsAt()` reads `Date.now()` internally (cache-TTL check),
  // an "unstable value" `cacheComponents` refuses to prerender statically.
  // `connection()` is the documented opt-in that marks this route dynamic
  // (request-time render) ahead of that read, without touching
  // lib/event/event-settings.ts, which this phase does not own.
  await connection();

  const [targetISO, t] = await Promise.all([
    getEventStartsAt(),
    getTranslations("countdown"),
  ]);

  // `getEventStartsAt()` is fail-open and resolves `null` on any failure
  // (unset env, unreachable Supabase, timeout, ...). `computeCountdown`'s
  // own contract returns the all-zero state for an unparseable target, so
  // passing `targetISO ?? ""` here needs no extra branch — the page always
  // serves 200 with "00/00/00" rather than erroring.
  const initial = computeCountdown(targetISO ?? "", new Date().toISOString());

  const labels = {
    days: t("days"),
    hours: t("hours"),
    minutes: t("minutes"),
  };

  return (
    <div
      data-testid="countdown-page"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#00101A]"
    >
      <CountdownBackground />
      <CountdownTicker
        targetISO={targetISO}
        initial={initial}
        title={t("title")}
        labels={labels}
      />
    </div>
  );
}
