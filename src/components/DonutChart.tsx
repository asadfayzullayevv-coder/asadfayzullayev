import React from 'react';
import {CATEGORIES, Category, CategoryId, Distribution} from '../data/categories';
import {mix, withAlpha} from '../utils/color';

const lighten = (hex: string, amount: number) => mix(hex, '#FFFFFF', amount);
const darken = (hex: string, amount: number) => mix(hex, '#0B0F19', amount);

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

const ringPath = (
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number,
) => {
  const sweep = Math.min(end - start, 359.99);
  const stop = start + sweep;
  const large = sweep > 180 ? 1 : 0;
  const [x1, y1] = polar(cx, cy, rOuter, start);
  const [x2, y2] = polar(cx, cy, rOuter, stop);
  const [x3, y3] = polar(cx, cy, rInner, stop);
  const [x4, y4] = polar(cx, cy, rInner, start);
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
};

export type DonutChartProps = {
  values: Distribution;
  /** Size of the square SVG viewport in CSS px. */
  size: number;
  thickness?: number;
  /** 0 -> 1 sweep-in of the whole ring. */
  reveal?: number;
  focus?: CategoryId | null;
  /** 0 -> 1 strength of the focus emphasis, so it can ease in. */
  focusStrength?: number;
  /** Degrees of slow idle rotation. Keeps the ring alive between morphs. */
  sway?: number;
  children?: React.ReactNode;
};

/**
 * The hero of the film: an animated donut. Values are morphed by the caller;
 * this component only draws whatever distribution it is handed, which keeps
 * every transition frame-accurate and interruption-safe.
 */
export const DonutChart: React.FC<DonutChartProps> = ({
  values,
  size,
  thickness = 34,
  reveal = 1,
  focus = null,
  focusStrength = 1,
  sway = 0,
  children,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 10;
  const rInner = rOuter - thickness;
  const gap = 1.4;
  const sweep = 360 * Math.max(0, Math.min(1, reveal));

  const visible = CATEGORIES.filter((c) => values[c.id] > 0.15);
  const total = visible.reduce((s, c) => s + values[c.id], 0) || 1;

  let cursor = 0;
  const slices = visible.map((c: Category) => {
    const share = (values[c.id] / total) * 360;
    const start = cursor;
    const end = cursor + share;
    cursor = end;
    return {category: c, start, end, share};
  });

  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* Each segment is lit rather than filled: a bright inner edge, the
              body colour, and a slightly deepened outer edge. That vertical
              ramp is what reads as a machined surface instead of flat paint. */}
          {slices.map(({category}) => (
            <linearGradient
              key={category.id}
              id={`slice-${category.id}`}
              x1="0"
              y1="0"
              x2="0.35"
              y2="1"
            >
              <stop offset="0%" stopColor={lighten(category.color, 0.3)} />
              <stop offset="42%" stopColor={category.color} />
              <stop offset="100%" stopColor={darken(category.color, 0.16)} />
            </linearGradient>
          ))}
          {slices.map(({category}) => (
            <filter
              key={`glow-${category.id}`}
              id={`slice-glow-${category.id}`}
              x="-45%"
              y="-45%"
              width="190%"
              height="190%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="7"
                floodColor={category.color}
                floodOpacity="0.55"
              />
            </filter>
          ))}
          <filter id="slice-lift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="6" stdDeviation="9" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Track so the ring keeps its shape while segments are still empty. */}
        <circle
          cx={cx}
          cy={cy}
          r={(rOuter + rInner) / 2}
          fill="none"
          stroke="rgba(11,15,25,0.05)"
          strokeWidth={thickness}
        />

        <g transform={`rotate(${sway} ${cx} ${cy})`}>
          {slices.map(({category, start, end, share}) => {
            const isFocus = focus === category.id;
            const clampedEnd = Math.min(end, sweep);
            if (clampedEnd - start <= 0.2) return null;

            const inset = Math.min(gap / 2, Math.max(0, (clampedEnd - start) / 2 - 0.1));
            const s = start + inset;
            const e = clampedEnd - inset;

            const mid = ((s + e) / 2 - 90) * (Math.PI / 180);
            const push = isFocus ? 9 * focusStrength : 0;
            const grow = isFocus ? 4 * focusStrength : 0;

            return (
              <g
                key={category.id}
                transform={`translate(${Math.cos(mid) * push} ${Math.sin(mid) * push})`}
                // The emphasised slice gets its own colour as a glow: the one
              // place in a light UI where neon reads as premium rather than cheap.
              filter={isFocus ? `url(#slice-glow-${category.id})` : undefined}
                opacity={focus && !isFocus ? 1 - 0.35 * focusStrength : 1}
              >
                <path
                  d={ringPath(cx, cy, rOuter + grow, rInner - grow * 0.4, s, e)}
                  fill={`url(#slice-${category.id})`}
                />
                {/* Specular: a thin bright arc riding the outer edge. */}
                <path
                  d={ringPath(cx, cy, rOuter + grow, rOuter + grow - thickness * 0.22, s, e)}
                  fill="rgba(255,255,255,0.26)"
                />
                {share > 26 ? (
                  <SliceLabel
                    cx={cx}
                    cy={cy}
                    r={(rOuter + rInner) / 2}
                    angle={(s + e) / 2}
                    text={`${Math.round((values[category.id] / total) * 100)}%`}
                  />
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const SliceLabel: React.FC<{
  cx: number;
  cy: number;
  r: number;
  angle: number;
  text: string;
}> = ({cx, cy, r, angle, text}) => {
  const [x, y] = polar(cx, cy, r, angle);
  return (
    <text
      x={x}
      y={y}
      fill="#FFFFFF"
      fontSize={16}
      fontWeight={700}
      textAnchor="middle"
      dominantBaseline="central"
      style={{letterSpacing: '-0.01em'}}
    >
      {text}
    </text>
  );
};
