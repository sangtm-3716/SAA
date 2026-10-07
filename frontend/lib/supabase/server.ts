import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Server-side Supabase client for Server Components and Route Handlers.
 * `setAll` is wrapped in try/catch because Next throws when cookies are set
 * from a Server Component render — expected and harmless as long as
 * middleware is refreshing the session on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore because
          // middleware refreshes the session on every request.
        }
      },
    },
  });
}
