import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { OSWALD, INTER } from "../theme";

const SWIPE_CARDS = [
  { rent: "320€", zone: "Granada Centro", color: "#0f2647", textColor: "#ffffff" },
  { rent: "280€", zone: "Zaidín", color: "#c9a227", textColor: "#0f2647" },
  { rent: "410€", zone: "Realejo", color: "#ffffff", textColor: "#0f2647" },
];

export const Scene3Solution: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = format === "vertical";

  const title = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 120 } });
  const subtitle = spring({ frame: frame - 22, fps, config: { damping: 18, stiffness: 120 } });

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
          fontSize: isVertical ? 72 : 58,
          lineHeight: 1.05,
          color: "#0f2647",
          fontWeight: 700,
          textTransform: "uppercase",
          maxWidth: 900,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [40, 0])}px)`,
        }}
      >
        Roomie Finder
      </div>
      <div
        style={{
fontFamily: INTER,
                  fontSize: isVertical ? 26 : 22,
                  fontWeight: 600,
                  padding: "12px 24px",
                  borderRadius: 999,
                  background: card.textColor === "#ffffff" ? "#0f2647" : "rgba(255,255,255,0.25)",
                  color: card.textColor === "#ffffff" ? "#ffffff" : "#0f2647",
                }}
              >
                {card.zone}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
