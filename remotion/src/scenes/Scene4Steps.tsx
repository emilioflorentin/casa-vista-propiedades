import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { OSWALD, INTER, beat } from "../theme";
import { Icon } from "../components/Icon";

const STEPS = [
  { emoji: "home", title: "Publica", desc: "Fotos de la vivienda y de la habitación + gastos reales" },
  { emoji: "user", title: "Perfil", desc: "Horarios, limpieza, mascotas y estilo de vida" },
  { emoji: "heart", title: "Desliza", desc: "Me gusta a la derecha, paso a la izquierda" },
  { emoji: "chat", title: "Match", desc: "WhatsApp solo si ambos queréis" },
];

export const Scene4Steps: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = format === "vertical";

  const title = spring({ frame: frame - 2, fps, config: { damping: 13, stiffness: 200 } });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isVertical ? "60px 52px" : 80,
      }}
    >
      <div
        style={{
          fontFamily: OSWALD,
          fontSize: isVertical ? 70 : 54,
          lineHeight: 1,
          color: "#ffffff",
          fontWeight: 700,
          textTransform: "uppercase",
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [40, 0])}px)`,
          textShadow: "0 14px 40px rgba(0,0,0,0.45)",
        }}
      >
        Así <span style={{ color: "#e3c45a" }}>funciona</span>
      </div>

      <div
        style={{
          marginTop: isVertical ? 52 : 40,
          display: "grid",
          gridTemplateColumns: isVertical ? "1fr" : "1fr 1fr",
          gap: isVertical ? 20 : 18,
          width: "100%",
          maxWidth: isVertical ? 900 : 940,
        }}
      >
        {STEPS.map((step, i) => {
          const s = spring({ frame: frame - (16 + i * 9), fps, config: { damping: 13, stiffness: 190 } });
          const b = beat(frame, i * 5);
          const float = Math.sin((frame + i * 25) * 0.055) * 6;
          return (
            <div
              key={step.title}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 24,
                padding: isVertical ? 26 : 22,
                boxShadow: "0 20px 50px rgba(0,0,0,0.32)",
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [70, 0])}px) translateY(${float}px) scale(${interpolate(s, [0, 1], [0.88, 1])})`,
                borderLeft: `6px solid rgba(227,196,90,${0.6 + b * 0.4})`,
              }}
            >
              <div
                style={{
                  width: isVertical ? 78 : 62,
                  height: isVertical ? 78 : 62,
                  flexShrink: 0,
                  borderRadius: 20,
                  background: "rgba(227,196,90,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${1 + b * 0.07})`,
                }}
              >
                <Icon name={step.emoji} size={isVertical ? 40 : 32} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: OSWALD,
                    fontSize: isVertical ? 34 : 28,
                    color: "#e3c45a",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  <span style={{ opacity: 0.5, marginRight: 10 }}>0{i + 1}</span>
                  {step.title}
                </div>
                <div
                  style={{
                    fontFamily: INTER,
                    fontSize: isVertical ? 24 : 19,
                    color: "rgba(255,255,255,0.78)",
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
