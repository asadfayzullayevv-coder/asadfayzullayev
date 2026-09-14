import React from 'react';
import {Composition} from 'remotion';
import {AnorbankAd} from './AnorbankAd';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './timeline';
import {loadFonts} from './fonts';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="AnorbankCategorization"
      component={AnorbankAd}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
