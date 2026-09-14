import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {WordReveal} from '../components/WordReveal';
import {ease, font, stage} from '../theme';

/**
 * 0:00–0:10 — black, one question, nothing else.
 * The line lands word by word and then holds, so the drop at 0:10 hits silence.
 */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const kicker = interpolate(frame, [6, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.out,
  });

  const exit = interpolate(frame, [durationInFrames - 34, durationInFrames - 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.in,
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - exit,
        transform: `scale(${1 + exit * 0.06})`,
        filter: `blur(${exit * 12}px)`,
      }}
    >
      <div
        style={{
          fontFamily: font.family,
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: '0.42em',
          textTransform: 'uppercase',
          color: stage.textFaint,
          marginBottom: 46,
          opacity: kicker,
          transform: `translateY(${(1 - kicker) * 12}px)`,
        }}
      >
        Anorbank
      </div>

      <WordReveal
        lines={['А вы знаете,', 'что ваши расходы', 'рассказывают, кто вы?']}
        size={94}
        weight={800}
        lineHeight={1.1}
        stagger={9}
        delay={26}
        duration={30}
        align="center"
        rampFrom={0.05}
        rampTo={0.8}
        style={{maxWidth: 1320}}
      />
    </AbsoluteFill>
  );
};
