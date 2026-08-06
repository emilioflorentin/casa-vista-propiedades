import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { OSWALD, INTER, beat, beatScale } from "../theme";
import { Icon } from "../components/Icon";

const SWIPE_CARDS = [
  { rent: "410€", zone: "Realejo", gastos: "Gastos incluidos", bg: "linear-gradient(160deg,#1c3f74,#0d2245)", accent: "#e3c45a" },
  { rent: "280€", zone: "Zaidín", gastos: "Luz y agua aparte", bg: "linear-gradient(160deg,#e3c45a,#c9a227)", accent: "#0f2647" },
  { rent: "320€", zone: "Centro", gastos: "Gastos incluidos", bg: "linear-gradient(160deg,#ffffff,#e7e5e4)", accent: "#0f2647" },
];

export const Scene3Solution: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = format === "vertical";
  const b = beat(frame);

  const title = spring({ frame: frame - 4, fps, config: { damping: 13, stiffness: 200 } });
  const subtitle = spring({ frame: frame - 16, fps, config: { damping: 18, stiffness: 160 } });

  const cardW = isVertical ? 460 : 340;
  const cardH = isVertical ? 600 : 460;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isVertical ? 50 : 70,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: OSWALD,
          fontSize: isVertical ? 84 : 62,
          lineHeight: 1,
          color: "#ffffff",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: -1,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [50, 0])}px) scale(${beatScale(frame, 0.02)})`,
          textShadow: "0 14px 40px rgba(0,0,0,0.5)",
        }}
      >
        Roomie <span style={{ color: "#e3c45a" }}>Finder</span>
      </div>
      <div
        style={{
          fontFamily: INTER,
          fontSize: isVertical ? 32 : 26,
          fontWeight: 500,
          color: "rgba(255,255,255,0.8)",
          maxWidth: 820,
          marginTop: 14,
          opacity: subtitle,
          transform: `translateY(${interpolate(subtitle, [0, 1], [28, 0])}px)`,
        }}
      >
        Desliza, compara y haz match con compañeros reales.
      </div>

      <div
        style={{
          position: "relative",
          width: cardW,
          height: cardH,
          marginTop: isVertical ? 54 : 36,
        }}
      >
        {SWIPE_CARDS.map((card, i) => {
          const idx = SWIPE_CARDS.length - 1 - i; // top card swipes first
          const appear = spring({ frame: frame - (28 + i * 6), fps, config: { damping: 15, stiffness: 160 } });
          const swipeStart = idx === 0 ? 100000 : 66 + (idx - 1) * 40;
          const p = interpolate(frame, [swipeStart, swipeStart + 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const dir = idx % 2 === 0 ? 1 : -1;
          const x = interpolate(p, [0, 1], [0, 900 * dir]);
          const rot = interpolate(p, [0, 1], [0, 26 * dir]);
          const depth = i * 1;
          const stamp = interpolate(frame, [swipeStart - 6, swipeStart + 2], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const liked = dir > 0;

          return (
            <div
              key={card.zone}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 36,
                background: card.bg,
                boxShadow: "0 34px 80px rgba(0,0,0,0.45)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: card.accent,
                opacity: appear * (1 - p),
                transform: `translate(${x}px, ${-depth * 16}px) rotate(${rot + interpolate(appear, [0, 1], [dir * 8, depth * -2])}deg) scale(${interpolate(appear, [0, 1], [0.75, 1 - depth * 0.04])})`,
                zIndex: 10 - i,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 34,
                  left: 34,
                  fontFamily: INTER,
                  fontSize: isVertical ? 22 : 18,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  opacity: 0.6,
                }}
              >
                Habitación
              </div>
              <div style={{ fontFamily: OSWALD, fontSize: isVertical ? 96 : 74, fontWeight: 700, lineHeight: 1 }}>
                {card.rent}
              </div>
              <div style={{ fontFamily: INTER, fontSize: isVertical ? 26 : 22, opacity: 0.75, marginTop: 6 }}>/ mes</div>
              <div
                style={{
                  marginTop: 34,
                  fontFamily: OSWALD,
                  fontSize: isVertical ? 38 : 30,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {card.zone}
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontFamily: INTER,
                  fontSize: isVertical ? 22 : 18,
                  fontWeight: 600,
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: `2px solid ${card.accent}`,
                  opacity: 0.85,
                }}
              >
                {card.gastos}
              </div>

              {/* LIKE / NOPE stamp */}
              <div
                style={{
                  position: "absolute",
                  top: 60,
                  [liked ? "left" : "right"]: 40,
                  fontFamily: OSWALD,
                  fontSize: isVertical ? 54 : 42,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: liked ? "#22c55e" : "#ef4444",
                  border: `6px solid ${liked ? "#22c55e" : "#ef4444"}`,
                  borderRadius: 16,
                  padding: "6px 18px",
                  transform: `rotate(${liked ? -18 : 18}deg) scale(${interpolate(stamp, [0, 1], [1.4, 1])})`,
                  opacity: stamp,
                } as React.CSSProperties}
              >
                {liked ? "Me gusta" : "Paso"}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: isVertical ? 44 : 30,
          display: "flex",
          gap: 26,
          opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {["cross", "heart"].map((ic, i) => (
          <div
            key={ic}
            style={{
              width: isVertical ? 96 : 76,
              height: isVertical ? 96 : 76,
              borderRadius: "50%",
              background: i === 0 ? "rgba(255,255,255,0.1)" : "#e3c45a",
              color: i === 0 ? "#ffffff" : "#0f2647",
              border: "2px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${1 + (i === 1 ? b * 0.14 : 0)})`,
            }}
          >
            <Icon name={ic} size={isVertical ? 44 : 34} color={i === 0 ? "#ffffff" : "#0f2647"} strokeWidth={2.2} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
