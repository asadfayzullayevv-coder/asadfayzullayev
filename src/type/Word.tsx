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

/**
 * One word, one span per letter.
 *
 * Everything kinetic in this film animates letters, not blocks — that is the
 * difference between typography that performs and text that merely appears.
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
      {chars.map((ch, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            color: toneColor(tone, from + (to - from) * (i / n)),
            willChange: 'transform, opacity, filter',
            ...(letterStyle ? letterStyle(i, chars.length) : null),
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
};
