import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { INTER } from "./theme";
import { PersistentBackground } from "./components/PersistentBackground";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Solution } from "./scenes/Scene3Solution";
import { Scene4Steps } from "./scenes/Scene4Steps";
import { Scene5CTA } from "./scenes/Scene5CTA";

export const MainVideo: React.FC<{ format?: "vertical" | "square" }> = ({ format = "vertical" }) => {
  return (
    <AbsoluteFill style={{ background: "#0a1830", fontFamily: INTER }}>
      <Audio src={staticFile("audio/roomie-track.m4a")} volume={0.85} />
      <PersistentBackground format={format} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene1Hook format={format} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2Problem format={format} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 26, stiffness: 130 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={200}>
          <Scene3Solution format={format} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={clockWipe({ width: 1080, height: 1920 })}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene4Steps format={format} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 26, stiffness: 130 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={190}>
          <Scene5CTA format={format} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
