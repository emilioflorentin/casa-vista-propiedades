import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { OSWALD, INTER } from "../theme";
import { OSWALD, INTER } from "../theme";

const PROBLEMS = [
  { text: "Grupos de WhatsApp saturados", icon: "💬" },
  { text: "Fotos que no se corresponden", icon: "📸" },
  { text: "Gastos ocultos al llegar", icon: "💸" },
  { text: "Compañeros incompatibles", icon: "🤷" },
];

export const Scene2Problem: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = format === "vertical";

  const title = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 120 } });

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
      <div
        style={{
fontFamily: OSWALD,
          fontSize: isVertical ? 64 : 52,
          lineHeight: 1.1,
          color: "#0f2647",
          fontWeight: 700,
          textTransform: "uppercase",
          maxWidth: 900,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [30, 0])}px)`,
        }}
      >
        Encontrar piso compartido es un desastre
      </div>

      <div
        style={{
          marginTop: isVertical ? 50 : 40,
          display: "grid",
          gridTemplateColumns: isVertical ? "1fr" : "1fr 1fr",
          gap: isVertical ? 24 : 20,
          width: "100%",
          maxWidth: isVertical ? 720 : 900,
        }}
      >
        {PROBLEMS.map((p, i) => {
          const s = spring({ frame: frame - (22 + i * 10), fps, config: { damping: 16, stiffness: 140 } });
          return (
            <div
              key={p.text}
              style={{
                background: "#ffffff",
                borderRadius: 20,
                padding: isVertical ? 24 : 20,
                boxShadow: "0 10px 30px rgba(15,38,71,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                textAlign: "left",
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
              }}
            >
              <span style={{ fontSize: isVertical ? 44 : 36 }}>{p.icon}</span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: isVertical ? 28 : 24,
                  fontWeight: 600,
                  color: "#44403c",
                }}
              >
                {p.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
