import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const { fontFamily: OSWALD } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

export const { fontFamily: INTER } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const COLORS = {
  navy: "#0f2647",
  gold: "#c9a227",
  stoneBg: "#f5f5f4",
  stoneText: "#44403c",
  white: "#ffffff",
};

/** Music tempo: 124 BPM at 30fps */
export const BPM = 124;
export const FPB = (30 * 60) / BPM;

/** Percussive pulse synced to the beat (0 -> 1 decay each beat). */
export const beat = (frame: number, offset = 0) => {
  const p = (((frame - offset) % FPB) + FPB) % FPB;
  return Math.pow(1 - p / FPB, 3);
};

/** Subtle scale pulse for hero elements. */
export const beatScale = (frame: number, amount = 0.03, offset = 0) =>
  1 + beat(frame, offset) * amount;
