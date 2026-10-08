import { Montserrat } from "next/font/google";

/**
 * The SAA 2025 screens are set in Montserrat throughout (Figma uses weight
 * 700 for nearly every text node, 400/600 only inside raster assets).
 *
 * Two families appear in the Figma file that are deliberately NOT loaded:
 *
 * - "Montserrat Alternates" on the footer copyright node. It has no reliable
 *   "vietnamese" subset in next/font, and that string needs diacritics — see
 *   `common.footer`. Montserrat is visually near-identical at 16px.
 * - "SVN-Gotham" on the Kudos wordmark. That node ships as a vector asset
 *   (`/awards/kudos-logo-mark.svg`), so no webfont is needed.
 *
 * Declared once here because `next/font` loaders must be module-scope
 * singletons — calling `Montserrat()` in two modules would request the font
 * twice.
 */
export const montserrat = Montserrat({
  subsets: ["vietnamese", "latin"],
  weight: ["700"],
  variable: "--font-montserrat",
  display: "swap",
});
