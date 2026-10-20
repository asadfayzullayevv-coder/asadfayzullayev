import React from 'react';
import {SCREEN_H, SCREEN_W} from './ExpenseScreen';

/**
 * Volumetric rim light wrapping the device.
 *
 * Two soft sources sit behind the handset — a cool key on one edge, a
 * pomegranate fill on the other — and their weight shifts with the device's
 * own rotation, so turning the phone turns which edge catches the light. A
 * static halo behind a rotating object is the fastest way to make a render
 * look like a sticker; this is what stops that.
 */
export const RimLight: React.FC<{rotY: number}> = ({rotY}) => {
  // -1 (turned left, right edge lit) … +1 (turned right, left edge lit)
  const turn = Math.max(-1, Math.min(1, rotY / 14));
  const left = 0.5 - turn * 0.42;
  const right = 0.5 + turn * 0.42;

  const rim = (side: 'left' | 'right', color: string, weight: number): React.CSSProperties => ({
    position: 'absolute',
    top: -30,
    bottom: -30,
    [side]: -26,
    width: 76,
    borderRadius: 60,
    background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${color} 22%, ${color} 78%, rgba(0,0,0,0) 100%)`,
    filter: 'blur(26px)',
    opacity: 0.16 + weight * 0.5,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: -14,
        top: -14,
        width: SCREEN_W + 40,
        height: SCREEN_H + 40,
        pointerEvents: 'none',
      }}
    >
      <div style={rim('left', 'rgba(178,204,255,0.85)', left)} />
      <div style={rim('right', 'rgba(255,96,124,0.8)', right)} />
      {/* A tight specular on the top edge keeps the bezel from reading flat. */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: -18,
          height: 40,
          borderRadius: 40,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(210,226,255,0.5) 50%, rgba(255,255,255,0) 100%)',
          filter: 'blur(18px)',
          opacity: 0.5,
        }}
      />
    </div>
  );
};
