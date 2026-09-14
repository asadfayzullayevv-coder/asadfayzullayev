import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {beatPulse, drift, easeOutExpo, kick} from '../motion';
import {TOTAL_FRAMES, scenes} from '../timeline';

/** Scene boundaries the camera reacts to. */
const CUTS = [
  scenes.entertainment.from,
  scenes.groceries.from,
  scenes.hookah.from,
  scenes.favorite.from,
  scenes.outro.from,
];

/**
 * A virtual camera over the whole film.
 *
 * Three layers stack here: a very slow push-in that runs for the entire 66s,
 * a stronger push that resolves as the handset arrives, and a continuous
 * hand-held drift. Together they guarantee the brief's hard requirement —
 * there is no frame in which everything is still.
 *
 * Grain and vignette deliberately live outside this wrapper: they belong to
 * the lens, not the scene, and moving them would betray the whole effect.
 */
export const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();

  // Slow push across the film: 5% over 66s is below conscious detection but
  // removes the "still image" feel entirely.
  const globalPush = interpolate(frame, [0, TOTAL_FRAMES], [1, 1.05]);

  // The reveal gets its own push, resolving as the phone settles.
  const revealPush = interpolate(
    easeOutExpo(Math.max(0, (frame - scenes.reveal.from) / 110)),
    [0, 1],
    [1.1, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Reaction to each cut: a lateral shove and a small zoom that decay.
  let cutX = 0;
  let cutZoom = 0;
  for (const cut of CUTS) {
    const k = kick(frame, cut, 40);
    cutX -= k * 26;
    cutZoom += k * 0.012;
  }

  const x = drift(frame, 1.2) * 7 + cutX;
  const y = drift(frame, 4.7) * 5;
  const rotate = drift(frame, 8.3) * 0.22;
  const scale = globalPush * revealPush * (1 + cutZoom) * (1 + beatPulse(frame) * 0.0035);

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: '50% 50%',
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
