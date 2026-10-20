import React from 'react';
import {font, gradients} from '../theme';

/**
 * White -> brand-red gradient type, per the brief. Rendered with
 * background-clip so the gradient tracks the glyphs, not the box.
 */
export const GradientText: React.FC<{
  children: React.ReactNode;
  size: number;
  weight?: number;
  lineHeight?: number;
  letterSpacing?: string;
  gradient?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  size,
  weight = 700,
  lineHeight = 1.06,
  letterSpacing = font.tighter,
  gradient = gradients.whiteToRed,
  style,
}) => (
  <span
    style={{
      fontFamily: font.family,
      fontSize: size,
      fontWeight: weight,
      lineHeight,
      letterSpacing,
      backgroundImage: gradient,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
      display: 'inline-block',
      ...style,
    }}
  >
    {children}
  </span>
);
