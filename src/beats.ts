import {FPS} from './timeline';

const s = (seconds: number) => Math.round(seconds * FPS);

/**
 * Every timed event in the film, in one table.
 *
 * Scenes do not exist as containers here — there is one continuous take, and
 * these are the moments along it. Overlap is deliberate and load-bearing: a
 * phrase's exit is scheduled after the next element's entrance so no beat ever
 * empties the frame, which is what separates a film from a slideshow.
 */
export const B = {
  // ── Opening ───────────────────────────────────────────────────────────
  knowIn: s(0.3),
  knowOut: s(2.4),
  heroIn: s(2.5),
  compress: s(5.0),
  ringForm: s(6.2),
  through: s(7.6),
  phoneIn: s(7.9),
  labelIn: s(9.6),
  labelOut: s(11.7),

  // ── Entertainment ─────────────────────────────────────────────────────
  entGrow: s(12.4),
  mnogo: s(12.2),
  razv: s(13.0),
  razvOut: s(17.3),
  love: s(18.0),
  loveOut: s(20.3),
  pora: s(21.0),
  porabotat: s(22.0),
  porabotatOut: s(26.3),
  collapseLabel: s(26.6),

  // ── Food ──────────────────────────────────────────────────────────────
  greenPush: s(28.0),
  produkty: s(29.3),
  produktyOut: s(32.6),
  family: s(33.3),
  familyOut: s(36.6),
  home: s(37.3),
  krepost: s(38.6),
  frameForm: s(40.0),
  throughFrame: s(40.6),

  // ── Custom category ───────────────────────────────────────────────────
  sheetOpen: s(41.5),
  typeName: s(42.3),
  created: s(44.3),
  hookahGrow: s(44.6),
  kalyan: s(45.6),
  kalyanOut: s(49.6),
  sportSmall: s(49.3),
  sportOut: s(51.3),
  joke: s(52.0),
  jokeOut: s(56.0),

  // ── The punchline ─────────────────────────────────────────────────────
  favSheet: s(56.3),
  favType: s(57.0),
  favCreated: s(59.0),
  favGrow: s(59.3),
  num: s(60.6),
  numOut: s(64.3),
  official: s(65.0),
  officialOut: s(66.3),
  punch: s(66.6),
  punchOut: s(70.0),

  // ── Ending ────────────────────────────────────────────────────────────
  toPoint: s(70.3),
  logo: s(71.3),
  monitoring: s(72.3),
  pullAway: s(73.3),
  fadeOut: s(75.6),
} as const;
