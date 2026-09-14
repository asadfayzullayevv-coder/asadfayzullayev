import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
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
 * Word-by-word entrance: rise + de-blur + fade, never a bounce.
 * The colour of each word is sampled from the brand ramp so a finished line
 * reads as one continuous white -> red gradient.
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
        <div key={li} style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start'}}>
          {line.map((word, wi) => {
            index += 1;
            const start = delay + index * stagger;
            const p = interpolate(frame, [start, start + duration], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: (x) => 1 - Math.pow(1 - x, 3),
            });
            const t = total > 1 ? index / (total - 1) : 1;
            const color = rampAt(rampFrom + (rampTo - rampFrom) * t);

            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  marginRight: '0.28em',
                  color,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 0.42 * size}px) scale(${0.96 + p * 0.04})`,
                  filter: `blur(${(1 - p) * 10}px)`,
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
