import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, staticFile } from "remotion";
import { OSWALD, INTER } from "../theme";

export const Scene1Hook: React.FC<{ format: "vertical" | "square" }> = ({ format }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s1 = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const s2 = spring({ frame: frame - 12, fps, config: { damping: 18, stiffness: 120 } });
  const s3 = spring({ frame: frame - 24, fps, config: { damping: 18, stiffness: 120 } });

  const sub = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  const scale = (t: number) => interpolate(t, [0, 1], [0.85, 1]);
  const y = (t: number) => interpolate(t, [0, 1], [40, 0]);

  const isVertical = format === "vertical";

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
          width: isVertical ? 260 : 200,
          height: "auto",
          objectFit: "contain",
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
          transform: `scale(${scale(s1)})`,
          marginBottom: isVertical ? 50 : 40,
        }}
      />

      <div
        style={{
          fontFamily: OSWALD,
          fontSize: isVertical ? 92 : 76,
          lineHeight: 1.05,
          color: "#0f2647",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: -1,
          opacity: s2,
          transform: `translateY(${y(s2)}px)`,
        }}
      >
        ¿Buscas
      </div>

      <div
        style={{
          fontFamily: OSWALD,
          fontSize: isVertical ? 92 : 76,
          lineHeight: 1.05,
          color: "#c9a227",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: -1,
          opacity: s3,
          transform: `translateY(${y(s3)}px)`,
        }}
      >
        compañero de piso?
      </div>

      <div
        style={{
          marginTop: isVertical ? 40 : 32,
          fontFamily: INTER,
          fontSize: isVertical ? 32 : 28,
          color: "#44403c",
          maxWidth: isVertical ? 720 : 680,
          opacity: sub,
          transform: `translateY(${interpolate(sub, [0, 1], [20, 0])}px)`,
        }}
      >
        Que no te la cuelen con gastos ocultos.
      </div>
    </AbsoluteFill>
  );
};
