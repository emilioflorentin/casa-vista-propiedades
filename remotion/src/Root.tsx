import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="roomie-promo-vertical"
      component={MainVideo}
      durationInFrames={750}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ format: "vertical" as const }}
    />
    <Composition
      id="roomie-promo-square"
      component={MainVideo}
      durationInFrames={750}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ format: "square" as const }}
    />
  </>
);
