import React from 'react';
import {brand, font, stage} from '../theme';

/**
 * Wordmark placeholder.
 *
 * Drop the official file at public/logo/anorbank.svg and swap the body of
 * this component for <Img src={staticFile('logo/anorbank.svg')} /> — nothing
 * else in the film references the mark directly.
 */
export const Logo: React.FC<{size?: number; mono?: boolean}> = ({size = 76, mono = false}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.22,
      fontFamily: font.family,
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: mono ? stage.text : `linear-gradient(140deg, ${brand.redBright}, ${brand.redDeep})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 18px 44px ${brand.redGlow}`,
      }}
    >
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.2 21 20.8h-5.1L12 12.4 8.1 20.8H3L12 3.2Z"
          fill={mono ? brand.red : '#FFFFFF'}
        />
      </svg>
    </div>
    <div
      style={{
        fontSize: size * 0.72,
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: stage.text,
      }}
    >
      Anorbank
    </div>
  </div>
);
