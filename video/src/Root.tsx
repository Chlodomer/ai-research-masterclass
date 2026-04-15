import React from "react";
import { Composition } from "remotion";
import { WorkshopVideo } from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WorkshopVideo"
      component={WorkshopVideo}
      durationInFrames={130 * 30}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
