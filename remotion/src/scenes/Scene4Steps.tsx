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
