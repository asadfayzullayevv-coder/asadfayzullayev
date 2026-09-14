import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {brand, stage} from '../theme';

/**
 * The stage: a near-black field with a slow-breathing pomegranate glow and a
 * fine grain. Static black reads flat on a 1080p render; this keeps it alive
 * without ever competing with the phone.
 */
export const Background: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame / 90) * 0.06;

  return (
    <AbsoluteFill style={{backgroundColor: stage.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 62% at 50% 46%, ${brand.redGlow} 0%, rgba(200,16,46,0.10) 42%, rgba(5,6,10,0) 72%)`,
          opacity: 0.55 * intensity,
          transform: `scale(${breathe})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(70% 70% at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 60%)',
          opacity: intensity,
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(80% 80% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.70) 100%)',
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
  // Shift the tile every frame so the grain shimmers instead of sitting still.
  const x = (frame * 13) % 180;
  const y = (frame * 7) % 180;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: GRAIN,
        backgroundPosition: `${x}px ${y}px`,
        opacity: 0.045,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};
