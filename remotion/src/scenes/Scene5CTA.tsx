import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, staticFile } from "remotion";
import { OSWALD, INTER, beat, beatScale } from "../theme";

export const Scene5CTA: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = format === "vertical";
  const b = beat(frame);

  const logo = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 190 } });
  const line1 = spring({ frame: frame - 14, fps, config: { damping: 14, stiffness: 200 } });
  const line2 = spring({ frame: frame - 22, fps, config: { damping: 12, stiffness: 200 } });
  const url = spring({ frame: frame - 36, fps, config: { damping: 11, stiffness: 200 } });

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
      {/* Radiating rings */}
      {[0, 1, 2].map((i) => {
        const p = ((frame + i * 30) % 90) / 90;
        const size = interpolate(p, [0, 1], [300, 1400]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "2px solid rgba(227,196,90,0.35)",
              opacity: interpolate(p, [0, 1], [0.5, 0]),
            }}
          />
        );
      })}

      <img
        src={staticFile("images/roomie-finder-logo.webp")}
        alt=""
        style={{
          width: isVertical ? 320 : 250,
          height: "auto",
          objectFit: "contain",
          opacity: logo,
          transform: `scale(${interpolate(logo, [0, 1], [0.6, 1]) * beatScale(frame, 0.03)}) translateY(${interpolate(logo, [0, 1], [40, 0])}px)`,
          filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.55))",
        }}
      />

      <div
        style={{
          marginTop: isVertical ? 56 : 42,
          fontFamily: OSWALD,
          fontSize: isVertical ? 76 : 60,
          lineHeight: 1,
          color: "#ffffff",
          fontWeight: 700,
          textTransform: "uppercase",
          opacity: line1,
          transform: `translateY(${interpolate(line1, [0, 1], [40, 0])}px)`,
        }}
      >
        Encuentra tu
      </div>
      <div
        style={{
          fontFamily: OSWALD,
          fontSize: isVertical ? 92 : 74,
          lineHeight: 1.02,
          color: "#e3c45a",
          fontWeight: 700,
          textTransform: "uppercase",
          opacity: line2,
          transform: `translateY(${interpolate(line2, [0, 1], [50, 0])}px) scale(${beatScale(frame, 0.025)})`,
          textShadow: "0 16px 44px rgba(0,0,0,0.5)",
        }}
      >
        compañero ideal
      </div>

      <div
        style={{
          marginTop: isVertical ? 58 : 44,
          background: "linear-gradient(90deg,#e3c45a,#c9a227)",
          color: "#0a1830",
          padding: isVertical ? "26px 50px" : "20px 40px",
          borderRadius: 999,
          fontFamily: INTER,
          fontSize: isVertical ? 32 : 26,
          fontWeight: 800,
          opacity: url,
          transform: `scale(${interpolate(url, [0, 1], [0.7, 1]) * (1 + b * 0.035)})`,
          boxShadow: `0 20px 55px rgba(227,196,90,${0.25 + b * 0.15})`,
        }}
      >
        nazarihomes.com/roomie-finder
      </div>

      <div
        style={{
          marginTop: isVertical ? 32 : 26,
          fontFamily: INTER,
          fontSize: isVertical ? 24 : 20,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.6)",
          opacity: url,
        }}
      >
        By Nazarí Homes
      </div>
    </AbsoluteFill>
  );
};
