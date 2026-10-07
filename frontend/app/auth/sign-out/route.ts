import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Clears the Supabase session server-side so a client-only `signOut()` never
 * leaves the server rendering a stale session until cookies expire. Status
 * 303 turns the POST into a GET on redirect, which is what a browser
 * form/fetch submission needs.
 */
export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}
