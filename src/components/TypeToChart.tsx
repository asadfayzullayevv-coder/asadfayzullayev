import React from 'react';
import {useCurrentFrame} from 'remotion';
import {DonutChart} from './DonutChart';
import {UIGeometry} from './UIGeometry';
import {STATES} from '../data/categories';
import {clamp01, easeInQuad, easeOutCubic, easeOutExpo, easeOutQuint, prog} from '../motion';
import {Word} from '../type/Word';

export type TypeToChartProps = {
  text: string;
  /** Frame the word starts compressing. */
  start: number;
  duration?: number;
  /** Type size at rest — must match the hero word it takes over from. */
  size: number;
  /** Diameter of the ring the word resolves into. */
  ring: number;
};

/**
 * The hinge of the whole film: the hero word physically becomes the chart.
 *
 * The word crushes horizontally into a single bright bar, and that bar is what
 * the ring is drawn from — a stroke sweeping a full turn, then resolving into
 * real category segments. An earlier version flew each letter to its own seat
 * on the circle; it read as confetti, because seven glyphs of wildly different
 * widths never land evenly. Compression keeps the cause and effect legible:
 * one shape becomes one shape.
 */
export const TypeToChart: React.FC<TypeToChartProps> = ({
  text,
  start,
  duration = 62,
  size,
  ring,
}) => {
  const frame = useCurrentFrame();

  // Phase 1: the word collapses to a vertical seed.
  const crush = easeOutExpo(prog(frame, start, duration * 0.34));
  // Phase 2: the ring winds on out of that seed.
  const sweep = easeOutQuint(prog(frame, start + duration * 0.26, duration * 0.62));
  // Phase 3: real segments resolve.
  const donut = easeOutCubic(prog(frame, start + duration * 0.48, duration * 0.6));
  const geometry =
    easeOutCubic(prog(frame, start - 30, 44)) * (1 - easeInQuad(prog(frame, start + duration + 6, 26)));

  const r = (ring / 2) * 0.865;
  const circumference = 2 * Math.PI * r;
  const seed = clamp01(crush * 1.2) * (1 - clamp01(sweep * 1.6));

  return (
    <div style={{position: 'relative', width: ring, height: ring}}>
      <UIGeometry size={ring * 1.28} progress={geometry} />

      {/* The compressing word. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scaleX(${1 - crush * 0.965}) scaleY(${1 + crush * 0.18})`,
          opacity: 1 - clamp01(Math.pow(crush, 1.6) * 1.25),
          filter: crush > 0.02 ? `blur(${crush * 10}px)` : undefined,
          whiteSpace: 'nowrap',
        }}
      >
        <Word text={text} size={size} weight={900} tone="fire" uppercase tracking="-0.03em" />
      </div>

      {/* The seed the ring is drawn from. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 10,
          height: size * (1.05 - sweep * 0.6),
          marginLeft: -5,
          transform: 'translateY(-50%)',
          borderRadius: 6,
          background: 'linear-gradient(180deg, #F5A623, #E8213F 55%, #C8102E)',
          boxShadow: '0 0 60px rgba(232,33,63,0.75)',
          opacity: seed,
        }}
      />

      {/* One full turn of stroke, drawn out of the seed. */}
      <svg
        width={ring}
        height={ring}
        viewBox={`0 0 ${ring} ${ring}`}
        style={{position: 'absolute', inset: 0, opacity: sweep > 0 ? 1 - donut * 0.9 : 0}}
      >
        <defs>
          <linearGradient id="ttc-sweep" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5A623" />
            <stop offset="55%" stopColor="#E8213F" />
            <stop offset="100%" stopColor="#C8102E" />
          </linearGradient>
        </defs>
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={r}
          fill="none"
          stroke="url(#ttc-sweep)"
          strokeWidth={ring * 0.13 * (0.35 + sweep * 0.65)}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - sweep)}
          transform={`rotate(-90 ${ring / 2} ${ring / 2})`}
        />
      </svg>

      {/* …and the stroke resolves into the real distribution. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: donut,
        }}
      >
        <DonutChart values={STATES.base} size={ring} thickness={ring * 0.13} reveal={1} />
      </div>
    </div>
  );
};
