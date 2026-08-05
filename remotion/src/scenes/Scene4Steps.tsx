import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { OSWALD, INTER } from "../theme";

const STEPS = [
  { emoji: "🏠", title: "Publica", desc: "Fotos de vivienda y habitación + gastos reales" },
  { emoji: "👤", title: "Perfil", desc: "Horarios, limpieza, mascotas y estilo de vida" },
  { emoji: "💚", title: "Desliza", desc: "Me gusta a la derecha, paso a la izquierda" },
  { emoji: "💬", title: "Match", desc: "Contacto por WhatsApp solo si ambos quieren" },
];

export const Scene4Steps: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = format === "vertical";

  const title = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 120 } });

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
          fontSize: isVertical ? 58 : 48,
          lineHeight: 1.1,
          color: "#0f2647",
          fontWeight: 700,
          textTransform: "uppercase",
          maxWidth: 900,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [30, 0])}px)`,
        }}
      >
        Así funciona
      </div>

      <div
        style={{
          marginTop: isVertical ? 50 : 40,
          display: "grid",
          gridTemplateColumns: isVertical ? "1fr" : "1fr 1fr",
          gap: isVertical ? 22 : 18,
          width: "100%",
          maxWidth: isVertical ? 760 : 920,
        }}
      >
        {STEPS.map((step, i) => {
          const s = spring({ frame: frame - (18 + i * 10), fps, config: { damping: 16, stiffness: 140 } });
          return (
            <div
              key={step.title}
              style={{
                background: "#ffffff",
                borderRadius: 24,
                padding: isVertical ? 28 : 22,
                boxShadow: "0 12px 30px rgba(15,38,71,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 18,
                textAlign: "left",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px)`,
                borderLeft: "6px solid #c9a227",
              }}
            >
              <span style={{ fontSize: isVertical ? 46 : 38, lineHeight: 1 }}>{step.emoji}</span>
              <div>
                <div
                  style={{
                    fontFamily: OSWALD,
                    fontSize: isVertical ? 30 : 26,
                    color: "#0f2647",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontFamily: INTER,
                    fontSize: isVertical ? 22 : 18,
                    color: "#57534e",
                    marginTop: 4,
                  }}
                >
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
