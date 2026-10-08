import { Montserrat, VT323 } from "next/font/google";

/**
 * Countdown screen typography per Figma:
 * - Title + unit labels ("DAYS"/"HOURS"/"MINUTES") use Montserrat weight 700
 *   (node 2268:35137, 2268:35143, 2268:35148, 2268:35153 — fontFamily
 *   "Montserrat", fontWeight 700).
 * - The LED-style digit glyphs are set in "Digital Numbers" in Figma (node
 *   I2268:35141;186:2617 and siblings — fontFamily "Digital Numbers",
 *   weight 400). **Deviation, reported plainly:** `next/font/google` does
 *   NOT export `Digital_Numbers` (confirmed via `tsc` — "has no exported
 *   member"), and no self-hosted copy of the exact typeface was available
 *   to fetch. `VT323` is used as a same-genre monospaced digital-readout
 *   substitute; it is NOT the same face as the design and reads visually
 *   thinner/more pixelated than the Figma reference. This is an
 *   approximation, not a match.
 */
export const montserrat = Montserrat({
  subsets: ["vietnamese", "latin"],
  weight: ["700"],
  variable: "--font-countdown-montserrat",
  display: "swap",
});

export const digitalNumbers = VT323({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-countdown-digital",
  display: "swap",
});
