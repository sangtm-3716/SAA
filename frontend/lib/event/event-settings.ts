import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Resolves the countdown/prelaunch event's launch instant.
 *
 * Fail-open contract: this function NEVER throws and NEVER rejects. Any
 * failure — unset env, unreachable Supabase, empty table, RLS denial,
 * unparseable value, timeout — resolves `null`. Consumers (the middleware
 * lock in lib/supabase/middleware.ts, and the countdown page) treat `null`
 * as "no lock, show zeros" — never as an error to propagate.
 *
 * Resolution order: `process.env.EVENT_STARTS_AT` (server-only, deliberately
 * NOT `NEXT_PUBLIC_` — it must never reach the browser bundle) →
 * `public.event_settings.starts_at` → `null`.
 *
 * `lib/supabase/server.ts` is not reused here: it awaits `cookies()` from
 * `next/headers`, which middleware cannot call, and this read needs no
 * session. A plain `@supabase/supabase-js` client with the publishable key
 * is used instead — no new dependency, and it runs unchanged in both the
 * Edge (middleware) and Node (server component) runtimes.
 *
 * Results are cached in-module for `CACHE_TTL_MS`, including `null` results,
 * so a dead Supabase is not retried on every request — middleware runs on
 * every matched request, and an uncached call there would put the whole
 * site behind Supabase's availability. Concurrent callers during a miss
 * share one in-flight request. This means the lock's transition at zero is
 * only accurate to within the TTL — acceptable because the target moves
 * rarely and the page itself ticks from the exact instant, not the cache.
 */

const CACHE_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 1_500;

interface CacheEntry {
  value: string | null;
  expiresAt: number;
}

let cache: CacheEntry | null = null;
let inFlight: Promise<string | null> | null = null;

function toIsoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function readFromDatabase(): Promise<string | null> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }),
      },
    });

    const { data, error } = await supabase
      .from("event_settings")
      .select("starts_at")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return toIsoOrNull(data.starts_at);
  } catch {
    // Network error, timeout abort, or any other unexpected failure — the
    // fail-open contract means this path always resolves `null`, never
    // throws, never rejects.
    return null;
  }
}

/**
 * Returns the event's launch instant as a canonical ISO 8601 UTC string, or
 * `null` if it cannot be determined. See the file header for the full
 * fail-open contract.
 */
export async function getEventStartsAt(): Promise<string | null> {
  const envValue = toIsoOrNull(process.env.EVENT_STARTS_AT);
  if (envValue !== null) {
    return envValue;
  }

  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.value;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = readFromDatabase()
    .then((value) => {
      cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      return value;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
