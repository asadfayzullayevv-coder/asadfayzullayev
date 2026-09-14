import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TypeToChart} from '../components/TypeToChart';
import {clamp01, easeInQuad, easeOutExpo, easeOutQuint, prog} from '../motion';
import {Assemble, MaskReveal} from '../type/kinetic';
import {Word} from '../type/Word';

// Scene-relative beats.
const T = {
  assemble: 14,
  assembleOut: 74,
  vashi: 84,
  hero: 92,
  morph: 150,
  through: 196,
};

/**
 * 0:00–0:09 — black, then a question that becomes the product.
 *
 * The sequence is deliberately three different mechanics back to back:
 * words arriving from separate depths, a single word scaling to own the
 * frame, then that word disassembling into the chart. Repeating one
 * entrance three times is what makes an ad look templated.
 */
export const Opening: React.FC = () => {
  const frame = useCurrentFrame();

  const assembleOut = easeInQuad(prog(frame, T.assembleOut, 16));
  const heroOut = easeOutQuint(prog(frame, T.morph, 26));
  const through = easeInQuad(prog(frame, T.through, 44));

  // The camera flies into the ring: it scales past the lens and blurs out.
  const ringScale = 1 + through * 13;
  const ringOpacity = 1 - clamp01(prog(frame, T.through + 14, 26));

  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'center', perspective: 1400, zIndex: 30}}
    >
      {/* "А ВЫ ЗНАЕТЕ" — assembled from depth, small and editorial. */}
      <div
        style={{
          position: 'absolute',
          opacity: 1 - assembleOut,
          transform: `translateY(${-assembleOut * 30}px) scale(${1 - assembleOut * 0.06})`,
          filter: assembleOut > 0.01 ? `blur(${assembleOut * 12}px)` : undefined,
          transformStyle: 'preserve-3d',
        }}
      >
        <Assemble words={['А', 'ВЫ', 'ЗНАЕТЕ']} size={46} start={T.assemble} tracking="0.38em" />
      </div>

      {/* "ВАШИ" is the supporting half of the hierarchy — deliberately tiny
          against the word it introduces. */}
      <div
        style={{
          position: 'absolute',
          transform: `translateY(${-190 - heroOut * 90}px) scale(${1 - heroOut * 0.2})`,
          opacity: (1 - heroOut) * clamp01(prog(frame, T.vashi, 14)),
        }}
      >
        <MaskReveal text="ВАШИ" size={54} start={T.vashi} duration={22} tone="white" weight={600} />
      </div>

      {/* "РАСХОДЫ" owns the frame, then leaves it as a ring. */}
      <div
        style={{
          position: 'absolute',
          opacity: 1 - clamp01(prog(frame, T.morph - 4, 8)),
          transform: `scale(${1 + heroOut * 0.04})`,
        }}
      >
        <HeroWord frame={frame} />
      </div>

      <div
        style={{
          position: 'absolute',
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
          filter: through > 0.2 ? `blur(${(through - 0.2) * 26}px)` : undefined,
        }}
      >
        {/* Size and tracking match HeroWord exactly, so the hand-off is
            invisible: the same letters simply keep going. */}
        <TypeToChart text="РАСХОДЫ" start={T.morph} duration={62} size={286} ring={540} />
      </div>
    </AbsoluteFill>
  );
};

/**
 * The hero word grows while its tracking collapses — the optical signature of
 * type being pushed toward the lens rather than merely enlarged.
 */
const HeroWord: React.FC<{frame: number}> = ({frame}) => {
  const p = easeOutExpo(prog(frame, T.hero, 30));
  const size = 96 + p * 190;

  return (
    <Word
      text="РАСХОДЫ"
      size={size}
      weight={900}
      tone="fire"
      uppercase
      tracking={`${0.16 - 0.19 * p}em`}
      letterStyle={(i, n) => {
        const edge = Math.abs(i - (n - 1) / 2) / Math.max(1, (n - 1) / 2);
        const lp = easeOutQuint(prog(frame, T.hero + edge * 5, 30));
        return {
          opacity: clamp01(lp * 1.5),
          transform: `translateY(${(1 - lp) * 60}px)`,
          filter: lp < 0.98 ? `blur(${(1 - lp) * 18}px)` : undefined,
        };
      }}
    />
  );
};
