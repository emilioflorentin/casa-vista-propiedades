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
          fontFamily: "'Inter', sans-serif",
          fontSize: isVertical ? 34 : 28,
          color: "#44403c",
          maxWidth: 800,
          marginTop: 16,
          opacity: subtitle,
          transform: `translateY(${interpolate(subtitle, [0, 1], [30, 0])}px)`,
        }}
      >
        Desliza, compara y haz match con compañeros reales.
      </div>

      <div
        style={{
          position: "relative",
          width: isVertical ? 420 : 360,
          height: isVertical ? 560 : 480,
          marginTop: isVertical ? 60 : 50,
        }}
      >
        {SWIPE_CARDS.map((card, i) => {
          const start = 35 + i * 12;
          const s = spring({ frame: frame - start, fps, config: { damping: 16, stiffness: 120 } });
          const exit = interpolate(frame, [start + 80, start + 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const xOffset = interpolate(exit, [0, 1], [0, 500]);
          const rotation = interpolate(exit, [0, 1], [0, 18]);

          return (
            <div
              key={card.rent + card.zone}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 32,
                background: card.color,
                boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: card.textColor,
                opacity: s,
                transform: `translateX(${xOffset}px) rotate(${rotation}deg) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
                zIndex: SWIPE_CARDS.length - i,
              }}
            >
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: isVertical ? 72 : 60, fontWeight: 700 }}>{card.rent}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: isVertical ? 28 : 24, opacity: 0.9, marginTop: 8 }}>/mes</div>
              <div
                style={{
                  marginTop: 32,
                  fontFamily: "'Inter', sans-serif",
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
