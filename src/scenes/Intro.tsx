import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {WordReveal} from '../components/WordReveal';
import {SPRING, clamp01, easeInQuad, easeOutCubic, prog} from '../motion';
import {font, stage} from '../theme';

/**
 * 0:00–0:10 — black, one question, nothing else.
 * The line lands word by word and then holds, so the drop at 0:10 hits silence.
 */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();

  const kickerSpring = spring({frame: frame - 6, fps, config: SPRING.land, durationInFrames: 28});
  const kicker = clamp01(easeOutCubic(prog(frame, 6, 22)));

  // The question doesn't fade out, it lifts away — which hands the drop at
  // 0:10 an empty frame to land in.
  const exit = easeInQuad(prog(frame, durationInFrames - 34, 32));

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - exit,
        transform: `translateY(${-exit * 46}px) scale(${1 + exit * 0.09})`,
        filter: exit > 0.01 ? `blur(${exit * 16}px)` : undefined,
      }}
    >
      <div
        style={{
          fontFamily: font.family,
          fontSize: 19,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: stage.textFaint,
          marginBottom: 46,
          opacity: kicker,
          transform: `translateY(${(1 - kickerSpring) * 16}px)`,
          letterSpacing: `${0.42 - (1 - kickerSpring) * 0.14}em`,
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
