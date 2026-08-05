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
