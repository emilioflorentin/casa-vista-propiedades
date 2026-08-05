import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const ACCENTS = [
  { x: 0.12, y: 0.2, size: 0.45, color: "#c9a227", speed: 0.02 },
  { x: 0.78, y: 0.35, size: 0.35, color: "#0f2647", speed: 0.015 },
  { x: 0.55, y: 0.75, size: 0.5, color: "#c9a227", speed: 0.025 },
  { x: 0.25, y: 0.85, size: 0.3, color: "#0f2647", speed: 0.018 },
];

export const PersistentBackground: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#f5f5f4" }}>
      {/* Soft gradient base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 30%, #ffffff 0%, #f5f5f4 60%, #e7e5e4 100%)",
        }}
      />

      {/* Floating blurred orbs */}
      {ACCENTS.map((a, i) => {
        const drift = Math.sin(frame * a.speed + i) * 40;
        const size = Math.min(width, height) * a.size;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width * a.x - size / 2 + drift,
              top: height * a.y - size / 2 + Math.cos(frame * a.speed + i) * 30,
              width: size,
              height: size,
              borderRadius: "50%",
              background: a.color,
              opacity: 0.08,
              filter: "blur(80px)",
            }}
          />
        );
      })}

      {/* Top gold bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: format === "vertical" ? 14 : 10,
          background: "linear-gradient(90deg, #c9a227, #e3c45a, #c9a227)",
        }}
      />
    </div>
  );
};
