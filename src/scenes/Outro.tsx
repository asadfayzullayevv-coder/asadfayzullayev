import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Logo} from '../components/Logo';
import {GradientText} from '../components/GradientText';
import {ease, font, stage} from '../theme';

/**
 * 1:02–1:06 — the stamp. Logo lands on the beat, the line resolves under it,
 * and the frame settles rather than moving again.
 */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const land = spring({frame, fps, config: {damping: 200, mass: 0.8, stiffness: 110}});
  const line = interpolate(frame, [16, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.out,
  });
  const sub = interpolate(frame, [34, 62], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.out,
  });

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          opacity: land,
          transform: `translateY(${(1 - land) * 28}px) scale(${0.94 + land * 0.06})`,
          filter: `blur(${(1 - land) * 10}px)`,
        }}
      >
        <Logo size={84} />
      </div>

      <div
        style={{
          marginTop: 54,
          opacity: line,
          transform: `translateY(${(1 - line) * 20}px)`,
        }}
      >
        <GradientText size={62} weight={800}>
          Категоризация в Anorbank
        </GradientText>
      </div>

      <div
        style={{
          marginTop: 24,
          fontFamily: font.family,
          fontSize: 26,
          color: stage.textMuted,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 14}px)`,
        }}
      >
        Понимай свои расходы — и себя.
      </div>
    </AbsoluteFill>
  );
};
