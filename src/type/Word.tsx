import React from 'react';
import {font} from '../theme';
import {fireAt, rampAt} from '../utils/color';

export type LetterStyle = (index: number, count: number) => React.CSSProperties;

export type WordProps = {
  text: string;
  size: number;
  weight?: number;
  /** 'white' for supporting copy, 'fire' for hero words, 'ramp' for mixed. */
  tone?: 'white' | 'fire' | 'ramp' | 'muted';
  /** Where in the ramp the first and last letter sit. */
  from?: number;
  to?: number;
  tracking?: string;
  lineHeight?: number;
  uppercase?: boolean;
  /** Soft bloom in each letter's own colour, 0–1. Zero for supporting copy. */
  glow?: number;
  /** Per-letter transform, the hook every kinetic effect animates through. */
  letterStyle?: LetterStyle;
  style?: React.CSSProperties;
};

const toneColor = (tone: WordProps['tone'], t: number) => {
  switch (tone) {
    case 'fire':
      return fireAt(t);
    case 'ramp':
      return rampAt(t);
    case 'muted':
      return 'rgba(255,255,255,0.5)';
    default:
      return '#FFFFFF';
  }
};

/** Re-express any colour the ramps produce as rgba at a given alpha. */
const atAlpha = (color: string, alpha: number) => {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b] = m[1].split(',').map((v) => parseFloat(v));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const h = color.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * One word, one span per letter.
 *
 * Everything kinetic in this film animates letters, not blocks — that is the
 * difference between typography that performs and text that merely appears.
 * The optional bloom is tinted with each letter's own colour rather than white,
 * so it reads as the type emitting light instead of a filter laid over it.
 */
export const Word: React.FC<WordProps> = ({
  text,
  size,
  weight = 800,
  tone = 'white',
  from = 0,
  to = 1,
  tracking = font.tighter,
  lineHeight = 0.98,
  uppercase = false,
  glow = 0,
  letterStyle,
  style,
}) => {
  const chars = Array.from(text);
  const n = Math.max(1, chars.length - 1);

  return (
    <span
      style={{
        display: 'inline-flex',
        fontFamily: font.family,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight,
        textTransform: uppercase ? 'uppercase' : undefined,
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const color = toneColor(tone, from + (to - from) * (i / n));
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color,
              textShadow:
                glow > 0
                  ? `0 0 ${size * 0.16 * glow}px ${atAlpha(color, 0.38 * glow)}, 0 0 ${size * 0.5 * glow}px ${atAlpha(color, 0.18 * glow)}`
                  : undefined,
              willChange: 'transform, opacity, filter',
              ...(letterStyle ? letterStyle(i, chars.length) : null),
            }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        );
      })}
    </span>
  );
};
