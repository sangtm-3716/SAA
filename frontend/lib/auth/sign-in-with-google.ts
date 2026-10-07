import { createClient } from "@/lib/supabase/client";

/**
 * Sends the browser to Supabase's `/auth/v1/authorize?provider=google` and
 * on to Google's consent screen. Must use the `@supabase/ssr` browser
 * client (via lib/supabase/client.ts) — it stores the PKCE `code_verifier`
 * in a cookie that `/auth/callback` (a server route) can read; the plain
 * `@supabase/supabase-js` client stores it in localStorage, invisible to
 * the server, and the exchange would fail every time.
 *
 * Exported as a plain async function with no UI concerns so the Track A
 * login button can take it as a prop (`onSignIn={signInWithGoogle}`)
 * without importing Supabase itself. Any pending/disabled/spinner state
 * around the click is the caller's responsibility and must be set
 * synchronously before awaiting this call.
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }
}
