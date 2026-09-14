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
          '0 72px 140px rgba(0,0,0,0.62)',
          '0 24px 56px rgba(0,0,0,0.5)',
          '0 6px 14px rgba(0,0,0,0.4)',
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

        {/* Glass, in three parts.
            A broad environment reflection the studio casts across the panel… */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(158deg, rgba(214,230,255,0.16) 0%, rgba(214,230,255,0.05) 22%, rgba(255,255,255,0) 46%, rgba(255,180,196,0.05) 82%, rgba(255,180,196,0.12) 100%)',
            mixBlendMode: 'screen',
          }}
        />
        {/* …a hard specular streak that travels as the device turns… */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `linear-gradient(112deg, rgba(255,255,255,0) ${glarePosition * 100 - 26}%, rgba(255,255,255,${0.32 * glare}) ${glarePosition * 100}%, rgba(255,255,255,0) ${glarePosition * 100 + 22}%)`,
            mixBlendMode: 'screen',
          }}
        />
        {/* …and a thin catch along the top edge where the glass curves. */}
        <div
          style={{
            position: 'absolute',
            left: 26,
            right: 26,
            top: 0,
            height: 3,
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)',
            filter: 'blur(1.2px)',
          }}
        />
        {/* Edge darkening so the screen sits inside the glass */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 26px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
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
