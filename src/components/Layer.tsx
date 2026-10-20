import React from 'react';
import {cameraAt, placedTransform, project} from '../world';

export type LayerProps = {
  frame: number;
  /** World coordinates, origin at frame centre. */
  x?: number;
  y?: number;
  /** Depth: >1 nearer the lens, <1 further away. */
  parallax?: number;
  /** Stacking against the handset, which sits at 100. */
  z?: number;
  scale?: number;
  opacity?: number;
  blur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * Places children at a point in the world and lets the camera do the rest.
 *
 * Nothing in this film is positioned in screen space. That is the whole
 * difference: a word sitting still in the world still moves on screen,
 * because the camera never stops.
 */
export const Layer: React.FC<LayerProps> = ({
  frame,
  x = 0,
  y = 0,
  parallax = 1,
  z = 120,
  scale = 1,
  opacity = 1,
  blur = 0,
  children,
  style,
}) => {
  const placed = project(cameraAt(frame), x, y, parallax);
  if (opacity <= 0.001) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: placedTransform(placed, scale),
        transformOrigin: 'center center',
        opacity,
        filter: blur > 0.15 ? `blur(${blur}px)` : undefined,
        zIndex: z,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
