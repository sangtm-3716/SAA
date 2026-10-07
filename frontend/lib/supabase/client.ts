import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Browser Supabase client for use in Client Components. Must stay
 * `createBrowserClient` from `@supabase/ssr` — never `createClient` from
 * `@supabase/supabase-js`. Only `@supabase/ssr`'s browser client stores the
 * PKCE `code_verifier` in a cookie that the server-side `/auth/callback`
 * route can read; the plain client stores it in `localStorage`, which the
 * callback route handler cannot access, breaking `exchangeCodeForSession`.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
