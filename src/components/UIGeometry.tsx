import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01} from '../motion';

/**
 * The circular scaffolding that forms behind the headline before the word
 * becomes a chart.
 *
 * It exists to make the morph feel inevitable: by the time the letters move,
 * the frame has already told you a ring is coming.
 */
export const UIGeometry: React.FC<{size: number; progress: number}> = ({size, progress}) => {
  const frame = useCurrentFrame();
  const p = clamp01(progress);
  const r = size / 2;
  const ticks = 60;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}
    >
      <g opacity={p}>
        {[0.62, 0.78, 1].map((k, i) => (
          <circle
            key={i}
            cx={r}
            cy={r}
            r={(r - 2) * k * (0.9 + p * 0.1)}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={i === 2 ? 1.5 : 1}
            strokeDasharray={i === 1 ? '2 10' : undefined}
          />
        ))}
        <g transform={`rotate(${frame * 0.25} ${r} ${r})`}>
          {Array.from({length: ticks}).map((_, i) => {
            const a = (i / ticks) * Math.PI * 2;
            const inner = (r - 2) * 0.86;
            const outer = (r - 2) * (i % 5 === 0 ? 0.95 : 0.9);
            return (
              <line
                key={i}
                x1={r + Math.cos(a) * inner}
                y1={r + Math.sin(a) * inner}
                x2={r + Math.cos(a) * outer}
                y2={r + Math.sin(a) * outer}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={i % 5 === 0 ? 1.4 : 0.8}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
};
