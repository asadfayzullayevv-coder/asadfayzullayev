import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, font, stage} from '../theme';
import {withAlpha} from '../utils/color';
import {WordReveal} from './WordReveal';

export type CalloutProps = {
  /** Category name shown in the pill. */
  tag: string;
  /** Live percentage shown next to the tag. */
  value: string;
  color: string;
  headline: string[];
  subline?: string;
  /** Frames before the block starts. */
  delay?: number;
};

/**
 * The left-hand text column that carries each punchline.
 * Enters with the beat, holds, then leaves before the next scene so two
 * headlines never share the frame.
 */
export const Callout: React.FC<CalloutProps> = ({
  tag,
  value,
  color,
  headline,
  subline,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const inP = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.out,
  });
  const outP = interpolate(frame, [durationInFrames - 22, durationInFrames - 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.in,
  });

  const opacity = inP * (1 - outP);

  return (
    <div
      style={{
        position: 'absolute',
        left: 148,
        top: 0,
        bottom: 0,
        width: 720,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${(1 - inP) * 26 - outP * 22}px)`,
        filter: `blur(${outP * 8}px)`,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          alignSelf: 'flex-start',
          padding: '10px 18px 10px 14px',
          borderRadius: 999,
          border: `1px solid ${withAlpha(color, 0.35)}`,
          background: withAlpha(color, 0.10),
          marginBottom: 28,
          transform: `translateY(${(1 - inP) * 14}px)`,
        }}
      >
        <span style={{width: 12, height: 12, borderRadius: 6, background: color, display: 'block'}} />
        <span
          style={{
            fontFamily: font.family,
            fontSize: 22,
            fontWeight: 600,
            color: stage.text,
            letterSpacing: font.tight,
          }}
        >
          {tag}
        </span>
        <span
          style={{
            fontFamily: font.family,
            fontSize: 22,
            fontWeight: 800,
            color,
            letterSpacing: font.tight,
          }}
        >
          {value}
        </span>
      </div>

      <WordReveal
        lines={headline}
        size={66}
        weight={800}
        lineHeight={1.08}
        stagger={4}
        delay={delay + 6}
        rampFrom={0}
        rampTo={0.92}
      />

      {subline ? (
        <div
          style={{
            marginTop: 26,
            fontFamily: font.family,
            fontSize: 26,
            fontWeight: 400,
            lineHeight: 1.4,
            color: stage.textMuted,
            maxWidth: 620,
            opacity: interpolate(frame, [delay + 22, delay + 44], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: ease.out,
            }),
          }}
        >
          {subline}
        </div>
      ) : null}
    </div>
  );
};
