import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, font, stage} from '../theme';
import {WordReveal} from '../components/WordReveal';

/**
 * 0:10–0:22 — the phone owns the frame, so the copy here stays small and
 * top-aligned: a label, not a headline.
 */
export const RevealCaption: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const out = interpolate(frame, [durationInFrames - 30, durationInFrames - 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.in,
  });

  const kicker = interpolate(frame, [18, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.out,
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        paddingTop: 52,
        opacity: 1 - out,
        transform: `translateY(${-out * 16}px)`,
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
          opacity: kicker,
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
