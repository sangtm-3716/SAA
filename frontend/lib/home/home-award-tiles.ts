/**
 * Homepage "Hệ thống giải thưởng" award grid — mm:5005:14974 (mms_C2_Award
 * list), six tiles split across mm:2167:9074 (Frame 491) and mm:2167:9078
 * (Frame 493) on screen `i87tDx10uM`.
 *
 * Titles and descriptions are transcribed verbatim from each tile's
 * `mms_C2.x.2_*` / `mms_C2.x.3_*` TEXT node via `get_node`/`query_section` —
 * nothing here is paraphrased or invented. These are SHORT one-line
 * descriptions distinct from the long-form copy in
 * `lib/awards/award-categories.ts`; the two must not be confused or reused
 * for each other.
 *
 * `id` reuses the exact slug from `award-categories.ts` so `href` lands on
 * the matching anchor on the existing `/awards` page.
 *
 * Known design anomaly, transcribed as-is rather than corrected: the Best
 * Manager, Signature 2025 - Creator, and MVP tiles (mm:I2167:9079;214:1022,
 * mm:I2167:9080;214:1022, mm:I2167:9081;214:1022) all carry the identical
 * description string in the source Figma file — this is not a transcription
 * error. The Top Project Leader tile's description (mm:I2167:9077;214:1022)
 * also ends mid-sentence with a trailing comma in the source text.
 */

export type HomeAwardTile = {
  /** Anchor id; matches the slug used in `lib/awards/award-categories.ts`. */
  id: string;
  /** mm:…;214:1021 (mms_C2.x.2_*) — tile heading. */
  title: string;
  /** mm:…;214:1022 (mms_C2.x.3_*) — one-line description. */
  description: string;
  /** `/public/home/award-name-*.png` — the award-name overlay PNG. */
  nameImage: string;
  /** Intrinsic width of `nameImage`, in px, from its Figma node. */
  nameImageWidth: number;
  /** Intrinsic height of `nameImage`, in px, from its Figma node. */
  nameImageHeight: number;
  /** Anchor on the `/awards` page this tile's "Chi tiết" link targets. */
  href: string;
};

export const HOME_AWARD_TILES: HomeAwardTile[] = [
  {
    // mm:2167:9075 (mms_C2.1_Top Talent Award)
    id: "top-talent",
    title: "Top Talent",
    description: "Vinh danh top cá nhân xuất sắc trên mọi phương diện",
    nameImage: "/home/award-name-top-talent.png",
    nameImageWidth: 221,
    nameImageHeight: 35,
    href: "/awards#top-talent",
  },
  {
    // mm:2167:9076 (mms_C2.2_Top Project Award)
    id: "top-project",
    title: "Top Project",
    description:
      "Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật",
    nameImage: "/home/award-name-top-project.png",
    nameImageWidth: 232,
    nameImageHeight: 35,
    href: "/awards#top-project",
  },
  {
    // mm:2167:9077 (mms_C2.3_Top Project Leader Award)
    id: "top-project-leader",
    title: "Top Project Leader",
    description:
      "Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá,",
    nameImage: "/home/award-name-top-project-leader.png",
    nameImageWidth: 232,
    nameImageHeight: 64,
    href: "/awards#top-project-leader",
  },
  {
    // mm:2167:9079 (mms_C2.4_Best Manager Award)
    id: "best-manager",
    title: "Best Manager",
    description:
      "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm",
    nameImage: "/home/award-name-best-manager.png",
    nameImageWidth: 232,
    nameImageHeight: 30,
    href: "/awards#best-manager",
  },
  {
    // mm:2167:9080 (mms_C2.5_Signature 2025 - Creator Award)
    id: "signature-2025-creator",
    title: "Signature 2025 - Creator",
    description:
      "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm",
    nameImage: "/home/award-name-signature-2025-creator.png",
    nameImageWidth: 232,
    nameImageHeight: 54,
    href: "/awards#signature-2025-creator",
  },
  {
    // mm:2167:9081 (mms_C2.6_MVP Award)
    id: "mvp",
    title: "MVP (Most Valuable Person)",
    description:
      "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm",
    nameImage: "/home/award-name-mvp.png",
    nameImageWidth: 116,
    nameImageHeight: 52,
    href: "/awards#mvp",
  },
];
