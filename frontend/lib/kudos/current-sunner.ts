import { DEMO_SUNNER_CODE, kudosClient } from "./kudos-client";
import type { RecipientOption } from "./compose-types";

/**
 * Who "you" are on the Kudos screens.
 *
 * Sign-in does not work in this deployment and is not expected to, so there is
 * no session to read an identity from. The current user is MOCKED: it is the
 * seeded Sunner behind `DEMO_SUNNER_CODE`, which the board's right rail
 * ("Số Kudos bạn nhận được") has already been standing in for since it
 * shipped. Composing now uses the same stand-in, so "you" means one consistent
 * person across the whole feature rather than two different fictions.
 *
 * This is the single place that decides it. When sign-in lands, this function
 * becomes a session read and nothing above it has to change — the compose
 * action, the recipient list and the board rail all ask here.
 *
 * Fail-open like the rest of `lib/kudos/`: a dead Supabase resolves `null`,
 * and the caller reports that it cannot attribute a post rather than throwing.
 */

export interface CurrentSunner {
  id: string;
  name: string;
  code: string;
  avatarUrl: string | null;
}

export async function getCurrentSunner(): Promise<CurrentSunner | null> {
  try {
    const { data, error } = await kudosClient()
      .from("sunners")
      .select("id,full_name,employee_code,avatar_url")
      .eq("employee_code", DEMO_SUNNER_CODE)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id as string,
      name: (data.full_name as string) ?? "",
      code: (data.employee_code as string) ?? "",
      avatarUrl: (data.avatar_url as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Removes the current user from a recipient list.
 *
 * `create_kudos_post` rejects a self-Kudo (so does the `kudos_posts_no_self`
 * CHECK underneath it), so offering yourself in the picker would only ever
 * produce an error message. Filtered at the source instead.
 */
export function excludeSelf(
  recipients: RecipientOption[],
  currentSunnerId: string | null,
): RecipientOption[] {
  if (!currentSunnerId) return recipients;
  return recipients.filter((person) => person.id !== currentSunnerId);
}
