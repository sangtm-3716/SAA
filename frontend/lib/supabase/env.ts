/**
 * Static literal `process.env.X` reads — Next.js inlines these at build time
 * for the client bundle. Reading via a dynamic key (e.g. `process.env[key]`)
 * silently yields `undefined` in the browser, so both vars are referenced
 * verbatim here rather than looped over.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See frontend/.env.example.`
    );
  }
  return value;
}

export const SUPABASE_URL = requireEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

export const SUPABASE_PUBLISHABLE_KEY = requireEnv(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);
