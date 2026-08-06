import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, staticFile } from "remotion";
import { OSWALD, INTER, beat, beatScale } from "../theme";

const WORDS_1 = ["¿Buscas"];
const WORDS_2 = ["compañero", "de", "piso?"];

export const Scene1Hook: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = format === "vertical";
  const b = beat(frame);

  const logoS = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const sub = spring({ frame: frame - 42, fps, config: { damping: 20, stiffness: 140 } });

  const word = (i: number) =>
    spring({ frame: frame - (10 + i * 6), fps, config: { damping: 13, stiffness: 200 } });

  const renderWord = (w: string, i: number, color: string, size: number) => {
    const s = word(i);
    return (
      <span
        key={w + i}
        style={{
          display: "inline-block",
          marginRight: 18,
          fontFamily: OSWALD,
          fontSize: size,
          lineHeight: 1.02,
          color,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: -1,
          opacity: s,
          transform: `translateY(${interpolate(s, [0, 1], [70, 0])}px) rotate(${interpolate(s, [0, 1], [-6, 0])}deg) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
          textShadow: "0 12px 40px rgba(0,0,0,0.45)",
        }}
      >
        {w}
      </span>
    );
  };

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
      <img
        src={staticFile("images/roomie-finder-logo.webp")}
        alt=""
        style={{
          width: isVertical ? 280 : 210,
          height: "auto",
          objectFit: "contain",
          opacity: interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(logoS, [0, 1], [0.6, 1]) * beatScale(frame, 0.04)}) rotate(${interpolate(logoS, [0, 1], [-10, 0])}deg)`,
          marginBottom: isVertical ? 54 : 38,
          filter: "drop-shadow(0 18px 45px rgba(0,0,0,0.5))",
        }}
      />

      <div style={{ maxWidth: isVertical ? 900 : 1000 }}>
        {WORDS_1.map((w, i) => renderWord(w, i, "#ffffff", isVertical ? 96 : 80))}
        <br />
        {WORDS_2.map((w, i) =>
          renderWord(w, i + 1, "#e3c45a", isVertical ? 96 : 80)
        )}
      </div>

      <div
        style={{
          marginTop: isVertical ? 46 : 34,
          fontFamily: INTER,
          fontSize: isVertical ? 34 : 28,
          fontWeight: 500,
          color: "rgba(255,255,255,0.82)",
          maxWidth: isVertical ? 760 : 700,
          padding: "16px 30px",
          borderRadius: 999,
          border: `2px solid rgba(227,196,90,${0.35 + b * 0.5})`,
          background: "rgba(255,255,255,0.05)",
          opacity: sub,
          transform: `translateY(${interpolate(sub, [0, 1], [40, 0])}px)`,
        }}
      >
        Que no te la cuelen con gastos ocultos.
      </div>
    </AbsoluteFill>
  );
};
