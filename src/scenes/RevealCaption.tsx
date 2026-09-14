import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRING, clamp01, easeInQuad, prog} from '../motion';
import {font, stage} from '../theme';
import {WordReveal} from '../components/WordReveal';

/**
 * 0:10–0:22 — the phone owns the frame, so the copy here stays small and
 * top-aligned: a label, not a headline.
 */
export const RevealCaption: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();

  const out = easeInQuad(prog(frame, durationInFrames - 30, 24));
  const kicker = spring({frame: frame - 18, fps, config: SPRING.land, durationInFrames: 30});

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        paddingTop: 52,
        opacity: 1 - out,
        transform: `translateY(${-out * 26}px) scale(${1 - out * 0.03})`,
        filter: out > 0.01 ? `blur(${out * 8}px)` : undefined,
      }}
    >
      <div
        style={{
          fontFamily: font.family,
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: stage.textFaint,
          opacity: clamp01(kicker * 1.5),
          transform: `translateY(${(1 - kicker) * 14}px)`,
        }}
      >
        Категоризация расходов
      </div>
      <WordReveal
        lines={['Ваш сентябрь — в одном круге']}
        size={38}
        weight={700}
        stagger={5}
        delay={34}
        align="center"
        rampFrom={0.1}
        rampTo={0.85}
        style={{marginTop: 14}}
      />
    </AbsoluteFill>
  );
};
