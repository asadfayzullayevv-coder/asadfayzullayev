import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRING, clamp01, drift, easeInQuad, easeOutCubic, prog} from '../motion';
import {font, stage} from '../theme';
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
 *
 * Blocks hand over laterally: the incoming one springs in from the right,
 * the outgoing one accelerates away to the left under blur. A pair of
 * cross-fades in the same spot would read as a slide deck; the shared
 * direction of travel reads as a camera move.
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
  const {durationInFrames, fps} = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: SPRING.land,
    durationInFrames: 34,
  });
  const visible = easeOutCubic(prog(frame, delay, 20));
  // Exits accelerate — an ease-in on the way out keeps the cut feeling brisk.
  const out = easeInQuad(prog(frame, durationInFrames - 26, 22));

  const x = (1 - enter) * 64 - out * 72 + drift(frame, 6.4) * 3;
  const opacity = clamp01(visible) * (1 - out);

  // The pill leads the headline by a beat and carries its own overshoot.
  const pill = spring({frame: frame - delay, fps, config: SPRING.bounce, durationInFrames: 28});

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
        transform: `translate(${x}px, ${-out * 14}px) scale(${(0.985 + enter * 0.015) * (1 - out * 0.04)})`,
        filter: out > 0.01 ? `blur(${out * 10}px)` : undefined,
        willChange: 'transform, opacity, filter',
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
          background: withAlpha(color, 0.1),
          marginBottom: 28,
          transform: `translateY(${(1 - pill) * 18}px) scale(${0.9 + pill * 0.1})`,
          opacity: clamp01(pill * 1.6),
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: color,
            display: 'block',
            boxShadow: `0 0 ${10 + pill * 8}px ${withAlpha(color, 0.7)}`,
          }}
        />
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
        delay={delay + 8}
        duration={30}
        rampFrom={0}
        rampTo={0.92}
      />

      {subline ? (
        <Subline text={subline} delay={delay + 24} />
      ) : null}
    </div>
  );
};

/** The supporting line rises after the headline has landed. */
const Subline: React.FC<{text: string; delay: number}> = ({text, delay}) => {
  const frame = useCurrentFrame();
  const p = easeOutCubic(prog(frame, delay, 26));
  return (
    <div
      style={{
        marginTop: 26,
        fontFamily: font.family,
        fontSize: 26,
        fontWeight: 400,
        lineHeight: 1.4,
        color: stage.textMuted,
        maxWidth: 620,
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
        filter: p < 0.99 ? `blur(${(1 - p) * 6}px)` : undefined,
      }}
    >
      {text}
    </div>
  );
};
