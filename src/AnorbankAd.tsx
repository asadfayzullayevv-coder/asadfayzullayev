import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Background} from './components/Background';
import {Callout} from './components/Callout';
import {Camera} from './components/Camera';
import {CATEGORIES, CategoryId, distributionAt} from './data/categories';
import {Intro} from './scenes/Intro';
import {Outro} from './scenes/Outro';
import {PhoneLayer} from './scenes/PhoneLayer';
import {RevealCaption} from './scenes/RevealCaption';
import {MUSIC, PHONE_LAYER, scenes} from './timeline';

const colorOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.color;
const labelOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.label;

/**
 * Anorbank — "Категоризация расходов".
 * 66s, 1920x1080 @ 30fps.
 */
export const AnorbankAd: React.FC = () => {
  const frame = useCurrentFrame();
  const values = distributionAt(frame);
  // Normalised the same way the donut and the list are, so the pill can never
  // read a different number from the screen beside it.
  const total = CATEGORIES.reduce((sum, c) => sum + values[c.id], 0) || 1;
  const pct = (id: CategoryId) => `${Math.round((values[id] / total) * 100)}%`;

  return (
    <AbsoluteFill style={{backgroundColor: '#05060A'}}>
      <Background />

      {MUSIC.enabled ? <Audio src={staticFile(MUSIC.src)} /> : null}

      <Camera>
        <Sequence from={scenes.intro.from} durationInFrames={scenes.intro.durationInFrames}>
          <Intro />
        </Sequence>

        <Sequence from={PHONE_LAYER.from} durationInFrames={PHONE_LAYER.durationInFrames}>
          <PhoneLayer />
        </Sequence>

        <Sequence from={scenes.reveal.from} durationInFrames={scenes.reveal.durationInFrames}>
          <RevealCaption />
        </Sequence>

        <Sequence
          from={scenes.entertainment.from}
          durationInFrames={scenes.entertainment.durationInFrames}
        >
          <Callout
            tag={labelOf('entertainment')}
            value={pct('entertainment')}
            color={colorOf('entertainment')}
            headline={['Ты умеешь', 'жить.']}
            subline="Кино, бары, поездки — почти половина месяца. Но, кажется, пора поработать и над собой."
            delay={8}
          />
        </Sequence>

        <Sequence from={scenes.groceries.from} durationInFrames={scenes.groceries.durationInFrames}>
          <Callout
            tag={labelOf('groceries')}
            value={pct('groceries')}
            color={colorOf('groceries')}
            headline={['А ты —', 'семейный.']}
            subline="Продукты на первом месте: дом, ужины, забота о своих."
            delay={8}
          />
        </Sequence>

        <Sequence from={scenes.hookah.from} durationInFrames={scenes.hookah.durationInFrames}>
          <Callout
            tag={labelOf('hookah')}
            value={pct('hookah')}
            color={colorOf('hookah')}
            headline={['Кальян растёт.', 'Спорт — нет.']}
            subline="Своя категория «Кальян» — 37%. Спорт — 1%. Может, пора в зал?"
            delay={8}
          />
        </Sequence>

        <Sequence from={scenes.favorite.from} durationInFrames={scenes.favorite.durationInFrames}>
          <Callout
            tag={labelOf('favorite')}
            value={pct('favorite')}
            color={colorOf('favorite')}
            headline={['Больше половины —', 'на «Любимую».']}
            subline="Ну всё, диагноз ясен: ты подкаблучник. И, честно говоря, это красиво."
            delay={8}
          />
        </Sequence>

        <Sequence from={scenes.outro.from} durationInFrames={scenes.outro.durationInFrames}>
          <Outro />
        </Sequence>
      </Camera>
    </AbsoluteFill>
  );
};
