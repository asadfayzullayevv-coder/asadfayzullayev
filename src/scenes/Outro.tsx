import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Logo} from '../components/Logo';
import {GradientText} from '../components/GradientText';
import {SPRING, clamp01, drift, easeOutCubic, prog} from '../motion';
import {font, stage} from '../theme';

/**
 * 1:02–1:06 — the stamp. Logo lands on the beat, the line resolves under it,
 * and the frame settles rather than moving again.
 */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // The mark lands with a bounce; everything after it resolves calmly so the
  // last seconds settle instead of continuing to move.
  const land = spring({frame, fps, config: SPRING.bounce, durationInFrames: 30});
  const line = spring({frame: frame - 16, fps, config: SPRING.land, durationInFrames: 30});
  const sub = easeOutCubic(prog(frame, 34, 28));
  const breathe = drift(frame, 2.8) * 4;

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
          opacity: clamp01(line * 1.5),
          transform: `translateY(${(1 - line) * 26 + breathe * 0.6}px) scale(${0.97 + line * 0.03})`,
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
