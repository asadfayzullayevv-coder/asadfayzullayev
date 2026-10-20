import React from 'react';
import {useCurrentFrame} from 'remotion';
import {cameraAt, project} from '../world';

const COUNT = 44;

/** Deterministic pseudo-random in [0, 1) — stable across renders. */
const rnd = (i: number, salt: number) => {
  const x = Math.sin((i + 1) * 91.7 + salt * 47.13) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Ambient studio dust.
 *
 * Placed in the world, not on the screen, so the camera moves through it and
 * the parallax reads as air between the lens and the product. Amplitude is
 * held just above the threshold of notice — visible motes would be confetti,
 * and the brief that governs this film bans that outright. What they buy is
 * that no region of the frame is ever completely dead.
 */
export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);

  return (
    <>
      {Array.from({length: COUNT}).map((_, i) => {
        const depth = 0.45 + rnd(i, 1) * 0.9;
        const wx = (rnd(i, 2) - 0.5) * 2600;
        const wy = (rnd(i, 3) - 0.5) * 1500;
        const speed = 0.06 + rnd(i, 4) * 0.12;
        const t = frame * speed;

        const p = project(
          cam,
          wx + Math.sin(t * 0.021 + i) * 60,
          wy + Math.cos(t * 0.017 + i * 1.7) * 44 - t * 0.5,
          depth,
        );
        const size = 1.4 + rnd(i, 5) * 2.6;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: size,
              height: size,
              borderRadius: '50%',
              background: rnd(i, 6) > 0.78 ? 'rgba(232,33,63,0.55)' : 'rgba(255,255,255,0.5)',
              transform: `translate(-50%, -50%) translate(${p.x}px, ${p.y}px) scale(${p.scale})`,
              opacity: 0.1 + rnd(i, 7) * 0.16,
              filter: 'blur(0.4px)',
              zIndex: 5,
            }}
          />
        );
      })}
    </>
  );
};
