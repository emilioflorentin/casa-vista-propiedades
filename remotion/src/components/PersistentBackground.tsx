import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { beat } from "../theme";

const ORBS = [
  { x: 0.15, y: 0.18, size: 0.6, color: "#c9a227", speed: 0.021 },
  { x: 0.82, y: 0.34, size: 0.5, color: "#2b5fa8", speed: 0.016 },
  { x: 0.5, y: 0.78, size: 0.7, color: "#c9a227", speed: 0.026 },
  { x: 0.22, y: 0.9, size: 0.45, color: "#1e7f6b", speed: 0.019 },
];

export const PersistentBackground: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = beat(frame);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0a1830" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 25%, #16305a 0%, #0d1e3c 45%, #060f22 100%)",
        }}
      />

      {ORBS.map((o, i) => {
        const drift = Math.sin(frame * o.speed + i) * 70;
        const size = Math.min(width, height) * o.size * (1 + b * 0.02);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width * o.x - size / 2 + drift,
              top: height * o.y - size / 2 + Math.cos(frame * o.speed * 1.3 + i) * 55,
              width: size,
              height: size,
              borderRadius: "50%",
              background: o.color,
              opacity: 0.16 + b * 0.03,
              filter: "blur(110px)",
            }}
          />
        );
      })}

      {/* Diagonal moving light streaks */}
      {[0, 1, 2].map((i) => {
        const p = ((frame * (1.6 + i * 0.5)) % (width + 600)) - 300;
        return (
          <div
            key={`s${i}`}
            style={{
              position: "absolute",
              top: -height * 0.2,
              left: p,
              width: 2 + i,
              height: height * 1.4,
              background: "linear-gradient(180deg, transparent, rgba(201,162,39,0.35), transparent)",
              transform: "rotate(16deg)",
              opacity: 0.35,
            }}
          />
        );
      })}

      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          transform: `translateY(${interpolate(frame % 90, [0, 90], [0, 90])}px)`,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Beat-reactive gold bars */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: (format === "vertical" ? 12 : 9) * (1 + b * 0.9),
          background: "linear-gradient(90deg, #8c6f18, #e3c45a, #8c6f18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: (format === "vertical" ? 12 : 9) * (1 + b * 0.9),
          background: "linear-gradient(90deg, #8c6f18, #e3c45a, #8c6f18)",
        }}
      />
    </div>
  );
};
