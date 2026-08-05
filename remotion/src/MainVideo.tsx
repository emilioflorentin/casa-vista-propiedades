import { AbsoluteFill } from "remotion";
import { INTER } from "./theme";
import { TransitionSeries, fade } from "@remotion/transitions";
import { PersistentBackground } from "./components/PersistentBackground";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Solution } from "./scenes/Scene3Solution";
import { Scene4Steps } from "./scenes/Scene4Steps";
import { Scene5CTA } from "./scenes/Scene5CTA";

export const MainVideo: React.FC<{ format?: "vertical" | "square" }> = ({ format = "vertical" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ background: "#f5f5f4", fontFamily: "'Inter', sans-serif" }}>
      <PersistentBackground format={format} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene1Hook format={format} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade({})} timing={{ type: "from-end", durationInFrames: 20 }} />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene2Problem format={format} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade({})} timing={{ type: "from-end", durationInFrames: 20 }} />
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene3Solution format={format} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade({})} timing={{ type: "from-end", durationInFrames: 20 }} />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene4Steps format={format} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade({})} timing={{ type: "from-end", durationInFrames: 20 }} />
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene5CTA format={format} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
