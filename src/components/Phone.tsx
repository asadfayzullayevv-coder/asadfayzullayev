import React from 'react';
import {SCREEN_H, SCREEN_W} from './ExpenseScreen';

const BEZEL = 13;
const OUTER_R = 58;
const INNER_R = OUTER_R - BEZEL;

export type PhoneProps = {
  children: React.ReactNode;
  /** 0 -> 1 strength of the glass reflection sweeping across the screen. */
  glare?: number;
  /** Horizontal position of the glare, 0 -> 1. */
  glarePosition?: number;
  style?: React.CSSProperties;
};

/**
 * Photoreal-ish handset: titanium rail, black bezel, dynamic island,
 * a soft contact shadow and a glass reflection. No hands, no cursors —
 * the UI animates on its own, per the brief.
 */
export const Phone: React.FC<PhoneProps> = ({children, glare = 0.5, glarePosition = 0.3, style}) => {
  const w = SCREEN_W + BEZEL * 2;
  const h = SCREEN_H + BEZEL * 2;

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: OUTER_R,
        // Titanium rail: a conic sheen reads as brushed metal at 1080p.
        background:
          'conic-gradient(from 210deg, #6E7076, #26282D 12%, #A9ADB5 26%, #33363C 45%, #7C8189 62%, #202329 80%, #8E939B 92%, #6E7076 100%)',
        padding: 2.5,
        boxShadow: [
          '0 2px 2px rgba(255,255,255,0.10) inset',
          '0 60px 120px rgba(0,0,0,0.55)',
          '0 18px 44px rgba(0,0,0,0.45)',
          '0 0 0 1px rgba(255,255,255,0.06)',
        ].join(', '),
        ...style,
      }}
    >
      {/* Bezel */}
      <div
        style={{
          position: 'absolute',
          inset: 2.5,
          borderRadius: OUTER_R - 2.5,
          background: '#07080A',
        }}
      />

      {/* Screen */}
      <div
        style={{
          position: 'absolute',
          left: BEZEL,
          top: BEZEL,
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: INNER_R,
          overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        {children}

        {/* Glass reflection */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `linear-gradient(${112}deg, rgba(255,255,255,0) ${glarePosition * 100 - 26}%, rgba(255,255,255,${0.30 * glare}) ${glarePosition * 100}%, rgba(255,255,255,0) ${glarePosition * 100 + 22}%)`,
            mixBlendMode: 'screen',
          }}
        />
        {/* Edge darkening so the screen sits inside the glass */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 24px rgba(0,0,0,0.10)',
            borderRadius: INNER_R,
          }}
        />

        {/* Dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: 11,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 118,
            height: 34,
            borderRadius: 20,
            background: '#07080A',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 12,
              top: 11,
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #2B3550, #0B0E16 70%)',
            }}
          />
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 134,
            height: 5,
            borderRadius: 3,
            background: 'rgba(11,15,25,0.28)',
          }}
        />
      </div>

      {/* Side buttons */}
      <SideButton top={168} height={30} side="left" />
      <SideButton top={214} height={58} side="left" />
      <SideButton top={288} height={58} side="left" />
      <SideButton top={244} height={92} side="right" />
    </div>
  );
};

const SideButton: React.FC<{top: number; height: number; side: 'left' | 'right'}> = ({
  top,
  height,
  side,
}) => (
  <div
    style={{
      position: 'absolute',
      top,
      [side]: -2.5,
      width: 3,
      height,
      borderRadius: 2,
      background: 'linear-gradient(180deg, #9AA0A8, #3A3E45)',
    }}
  />
);
