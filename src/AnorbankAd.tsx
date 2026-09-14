import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background} from './components/Background';
import {Camera} from './components/Camera';
import {Entertainment} from './scenes/Entertainment';
import {Favorite} from './scenes/Favorite';
import {Groceries} from './scenes/Groceries';
import {Hookah} from './scenes/Hookah';
import {Opening} from './scenes/Opening';
import {Outro} from './scenes/Outro';
import {PhoneStage} from './scenes/PhoneStage';
import {Reveal} from './scenes/Reveal';
import {MUSIC, PHONE_LAYER, scenes} from './timeline';

/**
 * Anorbank — «Мониторинг расходов».
 * 76s, 1920x1080 @ 30fps.
 *
 * Layering is the whole composition: the handset sits at z-index 10, and each
 * chapter decides whether its typography belongs behind it (z 5, so the
 * product occludes the word) or in front of it (z 20). Type that can pass
 * behind the product is what stops the film reading as captions over a
 * screenshot.
 */
export const AnorbankAd: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#05060A'}}>
    <Background />

    {MUSIC.enabled ? <Audio src={staticFile(MUSIC.src)} /> : null}

    <Camera>
      {/* The handset is mounted once and never remounts. */}
      <Sequence from={PHONE_LAYER.from} durationInFrames={PHONE_LAYER.durationInFrames}>
        <PhoneStage />
      </Sequence>

      <Sequence from={scenes.opening.from} durationInFrames={scenes.opening.durationInFrames}>
        <Opening />
      </Sequence>

      <Sequence from={scenes.reveal.from} durationInFrames={scenes.reveal.durationInFrames}>
        <Reveal />
      </Sequence>

      <Sequence
        from={scenes.entertainment.from}
        durationInFrames={scenes.entertainment.durationInFrames}
      >
        <Entertainment />
      </Sequence>

      <Sequence from={scenes.groceries.from} durationInFrames={scenes.groceries.durationInFrames}>
        <Groceries />
      </Sequence>

      <Sequence from={scenes.hookah.from} durationInFrames={scenes.hookah.durationInFrames}>
        <Hookah />
      </Sequence>

      <Sequence from={scenes.favorite.from} durationInFrames={scenes.favorite.durationInFrames}>
        <Favorite />
      </Sequence>

      <Sequence from={scenes.outro.from} durationInFrames={scenes.outro.durationInFrames}>
        <Outro />
      </Sequence>
    </Camera>
  </AbsoluteFill>
);
