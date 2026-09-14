const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

/** Linear mix of two hex colours, t in [0, 1]. */
export const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
};

export const withAlpha = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Sample the white -> red brand ramp. Used to fake one continuous gradient
 * across separately-animated words without measuring layout.
 */
export const rampAt = (t: number, white = '#FFFFFF', hot = '#E8213F', deep = '#C8102E') => {
  const c = Math.max(0, Math.min(1, t));
  if (c < 0.55) return mix(white, hot, c / 0.55);
  return mix(hot, deep, (c - 0.55) / 0.45);
};
