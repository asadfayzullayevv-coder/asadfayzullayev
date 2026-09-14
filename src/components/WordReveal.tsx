import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRING, clamp01, easeOutCubic, prog} from '../motion';
import {font} from '../theme';
import {rampAt} from '../utils/color';

export type WordRevealProps = {
  /** Explicit line breaks keep the typographic rag under control. */
  lines: string[];
  size: number;
  weight?: number;
  lineHeight?: number;
  /** Frames between consecutive words. */
  stagger?: number;
  /** Frames before the first word appears. */
  delay?: number;
  /** Duration of a single word's entrance. */
  duration?: number;
  /** Where in the white -> red ramp the first and last word sit. */
  rampFrom?: number;
  rampTo?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
};

/**
 * Word-by-word entrance: rise, de-blur and a spring that carries each word a
 * hair past its resting size before settling.
 *
 * A plain fade reads as a slide transition; the overshoot is what makes type
 * feel physically placed. Opacity and blur ride separate eased curves so the
 * word is already legible by the time the spring is still resolving.
 */
export const WordReveal: React.FC<WordRevealProps> = ({
  lines,
  size,
  weight = 700,
  lineHeight = 1.1,
  stagger = 5,
  delay = 0,
  duration = 26,
  rampFrom = 0,
  rampTo = 1,
  align = 'left',
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = lines.map((l) => l.split(' '));
  const total = words.reduce((n, l) => n + l.length, 0);

  let index = -1;

  return (
    <div
      style={{
        fontFamily: font.family,
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        letterSpacing: font.tighter,
        textAlign: align,
        ...style,
      }}
    >
      {words.map((line, li) => (
        <div
          key={li}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: align === 'center' ? 'center' : 'flex-start',
          }}
        >
          {line.map((word, wi) => {
            index += 1;
            const start = delay + index * stagger;

            // Position and scale ride the spring (and its overshoot)…
            const s = spring({
              frame: frame - start,
              fps,
              config: SPRING.land,
              durationInFrames: duration,
            });
            // …while legibility resolves on its own, faster curve.
            const visible = easeOutCubic(prog(frame, start, duration * 0.7));
            const t = total > 1 ? index / (total - 1) : 1;

            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  marginRight: '0.28em',
                  color: rampAt(rampFrom + (rampTo - rampFrom) * t),
                  opacity: clamp01(visible),
                  transform: `translateY(${(1 - s) * 0.42 * size}px) scale(${0.86 + s * 0.14})`,
                  filter: visible < 0.995 ? `blur(${(1 - visible) * 14}px)` : undefined,
                  willChange: 'transform, opacity, filter',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
