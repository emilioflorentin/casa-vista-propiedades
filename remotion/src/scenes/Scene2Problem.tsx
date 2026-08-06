import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { OSWALD, INTER, beat } from "../theme";

const PROBLEMS = [
  { text: "Grupos de WhatsApp saturados", icon: "💬" },
  { text: "Fotos que no se corresponden", icon: "📸" },
  { text: "Gastos ocultos al llegar", icon: "💸" },
  { text: "Compañeros incompatibles", icon: "🤷" },
];

export const Scene2Problem: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = format === "vertical";

  const title = spring({ frame: frame - 3, fps, config: { damping: 14, stiffness: 190 } });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isVertical ? "flex-start" : "center",
        justifyContent: "center",
        padding: isVertical ? "60px 56px" : 80,
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontFamily: INTER,
          fontSize: isVertical ? 24 : 20,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "#e3c45a",
          opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
          marginBottom: 18,
        }}
      >
        El problema
      </div>

      <div
        style={{
          fontFamily: OSWALD,
          fontSize: isVertical ? 72 : 56,
          lineHeight: 1.02,
          color: "#ffffff",
          fontWeight: 700,
          textTransform: "uppercase",
          maxWidth: 900,
          opacity: title,
          transform: `translateX(${interpolate(title, [0, 1], [-70, 0])}px)`,
          textShadow: "0 14px 40px rgba(0,0,0,0.45)",
        }}
      >
        Buscar piso compartido es un <span style={{ color: "#e3c45a" }}>desastre</span>
      </div>

      <div
        style={{
          marginTop: isVertical ? 54 : 42,
          display: "grid",
          gridTemplateColumns: isVertical ? "1fr" : "1fr 1fr",
          gap: isVertical ? 20 : 18,
          width: "100%",
          maxWidth: isVertical ? 900 : 940,
        }}
      >
        {PROBLEMS.map((p, i) => {
          const s = spring({ frame: frame - (20 + i * 8), fps, config: { damping: 14, stiffness: 200 } });
          const b = beat(frame, i * 4);
          const float = Math.sin((frame + i * 20) * 0.05) * 5;
          return (
            <div
              key={p.text}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 22,
                padding: isVertical ? 24 : 20,
                boxShadow: `0 18px 45px rgba(0,0,0,${0.28 + b * 0.08})`,
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [i % 2 === 0 ? -110 : 110, 0])}px) translateY(${float}px) rotate(${interpolate(s, [0, 1], [i % 2 === 0 ? -4 : 4, 0])}deg)`,
              }}
            >
              <span style={{ fontSize: isVertical ? 46 : 38, transform: `scale(${1 + b * 0.08})`, display: "inline-block" }}>
                {p.icon}
              </span>
              <span
                style={{
                  fontFamily: INTER,
                  fontSize: isVertical ? 30 : 24,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.92)",
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
