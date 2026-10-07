import { Montserrat } from "next/font/google";

/**
 * Login screen uses Montserrat (weight 700) everywhere per the Figma design
 * (header language label, hero title/body, button label, footer copyright).
 *
 * Note: the footer copyright node in Figma is set to "Montserrat Alternates",
 * but that family does not reliably ship a "vietnamese" subset in next/font —
 * and the footer copy (see `common.footer` in messages/vi.json) needs
 * Vietnamese diacritics rendered correctly. Montserrat (this family) covers
 * Vietnamese and is visually very close to Montserrat Alternates at this
 * size, so it is used for the whole screen. See report for this documented
 * deviation.
 */
export const montserrat = Montserrat({
  subsets: ["vietnamese", "latin"],
  weight: ["700"],
  variable: "--font-montserrat",
  display: "swap",
});
