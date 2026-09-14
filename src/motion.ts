import {MUSIC, FPS} from './timeline';

/**
 * The film's motion vocabulary.
 *
 * Every moving thing pulls its curve from here. Motion reads as designed
 * rather than improvised only when the same handful of curves is reused —
 * one overshoot, one drift, one impulse.
 */

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Normalised progress of `duration` frames starting at `start`. */
export const prog = (frame: number, start: number, duration: number) =>
  clamp01((frame - start) / duration);

/** Overshoots past 1 and settles back — the core "premium" curve. */
export const easeOutBack = (t: number, amount = 1.4) => {
  const c = clamp01(t);
  const c3 = amount + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + amount * Math.pow(c - 1, 2);
};

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - clamp01(t), 5);
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -11 * clamp01(t)));
export const easeInQuad = (t: number) => Math.pow(clamp01(t), 2);

/**
 * Damped elastic: overshoots, settles back through one small counter-swing.
 *
 * `amp` is deliberately low. A full elastic curve on a data value reads as a
 * toy; one visible rebound reads as mass. Used for segment growth, where the
 * chart should feel like it has weight rather than like it is springing.
 */
export const easeOutElastic = (t: number, amp = 0.055, period = 0.42) => {
  const c = clamp01(t);
  if (c === 0 || c === 1) return c;
  return 1 + amp * Math.pow(2, -9 * c) * Math.sin(((c - period / 4) * (2 * Math.PI)) / period) * -1;
};

/**
 * A number that springs to its target instead of ramping.
 *
 * Counters that interpolate linearly are the single most obvious tell that a
 * UI shot is a render; a spring with a short settle reads as a real ticker.
 */
export const springNumber = (
  frame: number,
  at: number,
  from: number,
  to: number,
  duration = 34,
) => {
  const p = clamp01((frame - at) / duration);
  if (p <= 0) return from;
  if (p >= 1) return to;
  const eased = 1 - Math.pow(2, -10 * p) * Math.cos(p * Math.PI * 2.1);
  return from + (to - from) * Math.min(1, eased);
};

/** Symmetric ease used for long camera moves — no overshoot, no linearity. */
export const easeInOutCubicish = (t: number) => {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

/**
 * Organic drift in roughly [-1, 1].
 *
 * A single sine reads as a machine rocking; three at incommensurate
 * frequencies read as a hand holding a camera. `seed` decorrelates axes so x,
 * y and rotation never peak together.
 */
export const drift = (frame: number, seed = 0, speed = 1) => {
  const t = (frame / FPS) * speed;
  return (
    Math.sin(t * 0.37 + seed) * 0.6 +
    Math.sin(t * 0.61 + seed * 2.1) * 0.3 +
    Math.sin(t * 1.13 + seed * 3.7) * 0.1
  );
};

/**
 * A 0 -> 1 -> 0 impulse over `len` frames from `at`, weighted to decay
 * slower than it rises. Used to make the camera and the handset react to a
 * scene boundary instead of cutting through it.
 */
export const kick = (frame: number, at: number, len = 34) => {
  const p = (frame - at) / len;
  if (p <= 0 || p >= 1) return 0;
  return Math.sin(p * Math.PI) * (1 - p * 0.35);
};

/** Decaying peak on every musical beat, in [0, 1]. */
export const beatPulse = (frame: number, decayFrames = 9) => {
  const framesPerBeat = (60 / MUSIC.bpm) * FPS;
  const offset = MUSIC.offsetSec * FPS;
  const phase = (((frame - offset) % framesPerBeat) + framesPerBeat) % framesPerBeat;
  return Math.max(0, 1 - phase / decayFrames);
};

/**
 * Spring presets. Remotion's default damping of 10 is too loose for a bank
 * ad; these are tuned to land with weight.
 */
export const SPRING = {
  /** Visible, deliberate bounce — hero entrances. */
  bounce: {damping: 13, mass: 1, stiffness: 95},
  /** A single soft settle — the handset landing, text words. */
  land: {damping: 16, mass: 1.1, stiffness: 110},
  /** No overshoot at all — anything carrying data. */
  settle: {damping: 200, mass: 1, stiffness: 90},
  /** Slow, heavy glide — long positional moves. */
  glide: {damping: 200, mass: 1.6, stiffness: 60},
} as const;
