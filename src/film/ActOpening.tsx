import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Layer} from '../components/Layer';
import {TypeToChart} from '../components/TypeToChart';
import {B} from '../beats';
import {clamp01, easeInQuad, easeOutExpo, easeOutQuint, prog} from '../motion';
import {Word} from '../type/Word';
import {beatAt} from './beat';
import {PHONE_Z} from './PhoneObject';

/**
 * 0:00–0:11 — the question becomes the product.
 *
 * Three moves, no cuts: a small centred line the camera presses into; a hero
 * word the camera drives into until its letters leave the frame on both
 * sides; and that same word crushing into the ring the camera then flies
 * through. The handset is already in the world behind the ring the whole
 * time — it is discovered, not introduced.
 */
export const ActOpening: React.FC = () => {
  const frame = useCurrentFrame();

  const know = beatAt(frame, B.knowIn, B.knowOut, 34, 16);
  const hero = beatAt(frame, B.heroIn, B.through + 24, 26, 22);

  return (
    <>
      {know.live ? (
        <Layer
          frame={frame}
          y={0}
          z={PHONE_Z + 40}
          parallax={1.1}
          opacity={know.opacity}
          scale={0.98 + know.enter * 0.02}
          blur={(1 - know.enter) * 9 + know.exit * 14}
        >
          {/* Arrives as one composition, not as a queue of words: the letters
              share a single tracking collapse. */}
          <Word
            text="А ВЫ ЗНАЕТЕ?"
            size={46}
            weight={600}
            tone="white"
            uppercase
            tracking={`${0.62 - easeOutQuint(prog(frame, B.knowIn, 44)) * 0.28}em`}
          />
        </Layer>
      ) : null}

      {hero.live ? (
        <Layer
          frame={frame}
          z={PHONE_Z + 30}
          // Nearer the lens than the product: the same camera zoom throws this
          // past the frame while the handset behind it merely approaches.
          parallax={1.45}
          opacity={hero.opacity}
        >
          <TypeToChart
            text="РАСХОДЫ"
            start={B.compress}
            duration={B.through - B.compress + 30}
            size={300}
            ring={460}
            appear={easeOutExpo(prog(frame, B.heroIn, 24))}
          />
        </Layer>
      ) : null}

      <RevealLabel frame={frame} />
    </>
  );
};

/** The one piece of supporting copy in the reveal — deliberately almost nothing. */
const RevealLabel: React.FC<{frame: number}> = ({frame}) => {
  const b = beatAt(frame, B.labelIn, B.labelOut, 34, 18);
  if (!b.live) return null;

  const track = 0.62 - easeOutQuint(prog(frame, B.labelIn, 50)) * 0.26;

  return (
    <Layer
      frame={frame}
      y={-430}
      z={PHONE_Z + 40}
      parallax={1.15}
      opacity={b.opacity * 0.8}
      blur={(1 - b.enter) * 6}
    >
      <Word
        text="МОНИТОРИНГ РАСХОДОВ"
        size={22}
        weight={600}
        tone="muted"
        uppercase
        tracking={`${track}em`}
      />
    </Layer>
  );
};

/** Shared helper for acts that fade a whole group out on a shared curve. */
export const groupExit = (frame: number, at: number, dur = 20) => easeInQuad(prog(frame, at, dur));
export const groupIn = (frame: number, at: number, dur = 26) =>
  clamp01(easeOutExpo(prog(frame, at, dur)));
