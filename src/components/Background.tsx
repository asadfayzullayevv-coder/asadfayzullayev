import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {drift} from '../motion';
import {brand, stage} from '../theme';

/**
 * A studio, not a black rectangle.
 *
 * Three lights and a floor: a cool key from above, a pomegranate bounce that
 * wanders, and a graded floor that gives the frame a horizon for the product
 * to sit against. Grain and vignette live here too — they belong to the lens,
 * which is why nothing in this file is inside the world camera.
 */
export const Background: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const frame = useCurrentFrame();
  const breathe = 1 + drift(frame, 0.9, 0.7) * 0.07;
  const glowX = 50 + drift(frame, 3.4, 0.5) * 7;
  const glowY = 44 + drift(frame, 6.8, 0.4) * 5;

  return (
    <AbsoluteFill style={{backgroundColor: stage.bg}}>
      {/* Cool key from above — gives the black a direction. */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(72% 52% at 50% -8%, rgba(150,170,205,0.16) 0%, rgba(9,11,18,0) 70%)',
          opacity: intensity,
        }}
      />
      {/* Graded floor: the frame gets a horizon instead of infinite void. */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 52%, rgba(16,18,26,0.55) 84%, rgba(4,5,9,0.9) 100%)',
          opacity: intensity,
        }}
      />
      {/* Brand bounce, wandering so no two seconds light the same. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(56% 58% at ${glowX}% ${glowY}%, ${brand.redGlow} 0%, rgba(200,16,46,0.09) 44%, rgba(5,6,10,0) 74%)`,
          opacity: (0.44 + drift(frame, 9.1, 0.6) * 0.07) * intensity,
          transform: `scale(${breathe})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(80% 80% at 50% 50%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.74) 100%)',
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const x = (frame * 13) % 180;
  const y = (frame * 7) % 180;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: GRAIN,
        backgroundPosition: `${x}px ${y}px`,
        opacity: 0.04,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};
