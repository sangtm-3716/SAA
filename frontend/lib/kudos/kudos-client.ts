import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * The Supabase client the Kudos board reads through.
 *
 * The board is public data (the migration grants select-only to `anon`), so
 * this is the plain publishable-key client rather than the cookie-bound
 * `lib/supabase/server.ts` — no session is needed, and this one module then
 * works unchanged from both the Node and Edge runtimes.
 *
 * The timeout matters: `lib/kudos/queries.ts` promises never to throw, and a
 * fetch with no deadline would hang a request instead of failing open.
 */
const FETCH_TIMEOUT_MS = 2_500;

export function kudosClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }),
    },
  });
}

/**
 * The right rail is written in second person ("Số Kudos bạn nhận được"), but
 * this board ships before the auth-to-Sunner link exists. Until a signed-in
 * user can be resolved to a `sunners` row, the stats are those of one seeded
 * demo Sunner, and that substitution lives here rather than being smeared
 * across the UI.
 */
export const DEMO_SUNNER_CODE = "CEVC10";
