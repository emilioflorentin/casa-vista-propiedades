import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, staticFile } from "remotion";
import { OSWALD, INTER } from "../theme";

export const Scene5CTA: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = format === "vertical";

  const logo = spring({ frame: frame - 5, fps, config: { damping: 16, stiffness: 120 } });
  const line1 = spring({ frame: frame - 18, fps, config: { damping: 18, stiffness: 120 } });
  const line2 = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 120 } });
  const url = spring({ frame: frame - 42, fps, config: { damping: 16, stiffness: 140 } });

  const scale = (t: number) => interpolate(t, [0, 1], [0.9, 1]);
  const y = (t: number) => interpolate(t, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isVertical ? 60 : 80,
        textAlign: "center",
      }}
    >
      <img
        src={staticFile("images/roomie-finder-logo.webp")}
        alt=""
        style={{
          width: isVertical ? 300 : 240,
          height: "auto",
          objectFit: "contain",
          opacity: logo,
          transform: `scale(${scale(logo)}) translateY(${y(logo)}px)`,
        }}
      />

      <div
        style={{
          marginTop: isVertical ? 60 : 50,
fontFamily: OSWALD,
          fontSize: isVertical ? 86 : 70,
          lineHeight: 1.05,
          color: "#c9a227",
          fontWeight: 700,
          textTransform: "uppercase",
          maxWidth: 900,
          opacity: line2,
          transform: `translateY(${y(line2)}px)`,
        }}
      >
        compañero ideal
      </div>

      <div
        style={{
          marginTop: isVertical ? 60 : 48,
          background: "#0f2647",
          color: "#ffffff",
          padding: isVertical ? "24px 48px" : "20px 40px",
          borderRadius: 999,
          fontFamily: "'Inter', sans-serif",
          fontSize: isVertical ? 32 : 26,
          fontWeight: 700,
          opacity: url,
          transform: `scale(${scale(url)})`,
          boxShadow: "0 16px 40px rgba(15,38,71,0.25)",
        }}
      >
        nazarihomes.com/roomie-finder
      </div>

      <div
        style={{
          marginTop: isVertical ? 34 : 28,
          fontFamily: "'Inter', sans-serif",
          fontSize: isVertical ? 24 : 20,
          color: "#78716c",
          opacity: url,
        }}
      >
        By Nazarí Homes
      </div>
    </AbsoluteFill>
  );
};
