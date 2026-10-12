import { kudosClient } from "./kudos-client";
import type {
  AwardTitleOption,
  ComposeOptions,
  HashtagOption,
  RecipientOption,
} from "./compose-types";

/**
 * Reads that fill the three pickers on the "Viết Kudo" screen (`ihQ26W78P2`).
 *
 * Fail-open, matching `lib/kudos/queries.ts`: nothing here throws. A dead
 * Supabase yields empty lists, and the form degrades to its free-text paths
 * (the award title accepts anything, and hashtags are created on demand) —
 * which is a usable form rather than a 500. The recipient picker is the one
 * that genuinely cannot work empty, and the form says so instead of
 * presenting an empty menu with no explanation.
 *
 * These are public, non-session reads, so they go through `kudosClient()`
 * (publishable key, 2.5s timeout) rather than the cookie-bound server client.
 */

/**
 * Candidate recipients — mm:I520:11647;520:9873 ("Tìm kiếm").
 *
 * `is_featured` is the filter, not "every row in `sunners`": the seed creates
 * a 500-strong reactor-only pool purely so heart counts can spread, and those
 * are not people anyone should be able to address a Kudo to. The board draws
 * its spotlight cloud from the same flag.
 *
 * Returned whole rather than searched server-side per keystroke — the featured
 * set is dozens of rows, so one fetch and client-side filtering beats a
 * round-trip per character.
 */
export async function getRecipientOptions(): Promise<RecipientOption[]> {
  try {
    const { data, error } = await kudosClient()
      .from("sunners")
      .select("id,full_name,employee_code,avatar_url,departments(name)")
      .eq("is_featured", true)
      .order("full_name", { ascending: true });

    if (error || !data) return [];

    return data.map((row) => {
      // PostgREST returns an embedded to-one relation as an object, but types
      // it as a possible array; normalise rather than assert.
      const department = Array.isArray(row.departments) ? row.departments[0] : row.departments;
      return {
        id: row.id as string,
        name: (row.full_name as string) ?? "",
        code: (row.employee_code as string) ?? "",
        avatarUrl: (row.avatar_url as string | null) ?? null,
        departmentName: (department?.name as string | undefined) ?? null,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Suggestions for "Danh hiệu" — mm:I520:11647;1688:10437.
 *
 * A suggestion list, never a closed vocabulary: the field's own helper text
 * reads "Ví dụ: …", and `create_kudos_post` accepts any title without
 * consulting this table. An empty list here costs nothing but the dropdown.
 */
export async function getAwardTitleOptions(): Promise<AwardTitleOption[]> {
  try {
    const { data, error } = await kudosClient()
      .from("kudos_award_titles")
      .select("id,label")
      .order("position", { ascending: true })
      .order("label", { ascending: true });

    if (error || !data) return [];
    return data.map((row) => ({ id: row.id as string, label: row.label as string }));
  } catch {
    return [];
  }
}

/** Existing hashtags to offer before the user invents a new one. */
export async function getHashtagOptions(): Promise<HashtagOption[]> {
  try {
    const { data, error } = await kudosClient()
      .from("hashtags")
      .select("id,label,slug")
      .order("label", { ascending: true });

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id as string,
      label: row.label as string,
      slug: row.slug as string,
    }));
  } catch {
    return [];
  }
}

/** One round-trip's worth of options for the compose page. */
export async function getComposeOptions(): Promise<ComposeOptions> {
  const [recipients, awardTitles, hashtags] = await Promise.all([
    getRecipientOptions(),
    getAwardTitleOptions(),
    getHashtagOptions(),
  ]);
  return { recipients, awardTitles, hashtags };
}
