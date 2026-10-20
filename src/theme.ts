import {Easing} from 'remotion';

/**
 * Anorbank brand + video design tokens.
 * Everything visual reads from here, so a brand-book correction is a one-file change.
 */
export const brand = {
  // Pomegranate red. Replace with the exact brand HEX when the brand book arrives.
  red: '#C8102E',
  redBright: '#E8213F',
  redDeep: '#8E0B20',
  redGlow: 'rgba(200, 16, 46, 0.45)',
};

export const stage = {
  // Cinematic near-black backdrop for the whole film.
  bg: '#05060A',
  bgSoft: '#0B0D14',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.56)',
  textFaint: 'rgba(255, 255, 255, 0.30)',
  hairline: 'rgba(255, 255, 255, 0.10)',
};

/** Light, premium in-app palette for the Anorbank phone UI. */
export const ui = {
  bg: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F9FB',
  text: '#0B0F19',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  hairline: 'rgba(11, 15, 25, 0.07)',
  shadow: '0 12px 32px rgba(11, 15, 25, 0.08)',
};

export const font = {
  family:
    'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  tight: '-0.02em',
  tighter: '-0.035em',
};

/** Text gradient: white -> brand red, per the creative brief. */
export const gradients = {
  whiteToRed: `linear-gradient(100deg, #FFFFFF 0%, #FFFFFF 34%, ${brand.redBright} 88%, ${brand.red} 100%)`,
  redSheen: `linear-gradient(135deg, ${brand.redBright} 0%, ${brand.red} 55%, ${brand.redDeep} 100%)`,
};

/**
 * Motion vocabulary. Expensive-looking motion is slow-out, never linear,
 * and never bounces on typography.
 */
export const ease = {
  /** Standard premium ease-out for entrances. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Symmetric ease for value morphs (pie chart segments). */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** Soft ease for exits. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
};

/** Springs tuned to feel weighty rather than springy. */
export const springs = {
  soft: {damping: 200, mass: 0.9, stiffness: 90},
  glide: {damping: 200, mass: 1.4, stiffness: 70},
  snap: {damping: 200, mass: 0.6, stiffness: 140},
};
