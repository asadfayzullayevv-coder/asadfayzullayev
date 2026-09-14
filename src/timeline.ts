/**
 * Single source of truth for the film's timing.
 *
 * The cut is written in seconds, but every accent (type hit, segment pop,
 * push-through) is snapped to the musical grid, so re-syncing to the real
 * "Trendsetter" waveform later means editing MUSIC only.
 */
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const MUSIC = {
  /** Placeholder until the mp3 lands in public/audio/. */
  bpm: 100,
  /** Seconds before the first downbeat of the track. */
  offsetSec: 0,
  /** The drop after the intro — the type-to-chart morph is cut to land on it. */
  dropSec: 5,
  src: 'audio/trendsetter.mp3',
  /** Set to true once the licensed file is in public/audio/. */
  enabled: false,
};

const secPerBeat = () => 60 / MUSIC.bpm;

/** Absolute time (s) of beat n, counting from the first downbeat. */
export const beatSec = (n: number) => MUSIC.offsetSec + n * secPerBeat();

/** Absolute frame of beat n. */
export const beatFrame = (n: number) => Math.round(beatSec(n) * FPS);

/** Nearest beat frame to an arbitrary frame — used to snap accents. */
export const snapToBeat = (frame: number) => {
  const beats = (frame / FPS - MUSIC.offsetSec) / secPerBeat();
  return beatFrame(Math.round(beats));
};

export const sec = (s: number) => Math.round(s * FPS);

export type Scene = {
  id: string;
  from: number;
  durationInFrames: number;
  to: number;
};

const build = (spec: Array<[string, number, number]>): Record<string, Scene> => {
  const out: Record<string, Scene> = {};
  for (const [id, fromSec, toSec] of spec) {
    out[id] = {
      id,
      from: sec(fromSec),
      to: sec(toSec),
      durationInFrames: sec(toSec) - sec(fromSec),
    };
  }
  return out;
};

export const scenes = build([
  // Type assembles, becomes the chart, camera flies through it.
  ['opening', 0, 9],
  // The handset resolves out of the ring and settles.
  ['reveal', 9, 13.5],
  ['entertainment', 13.5, 26],
  ['groceries', 26, 37.5],
  ['hookah', 37.5, 52],
  ['favorite', 52, 68],
  ['outro', 68, 76],
]);

/** The handset exists from inside the opening morph to the last frame. */
export const PHONE_LAYER = {
  from: sec(6.8),
  durationInFrames: scenes.outro.to - sec(6.8),
};

export const TOTAL_FRAMES = scenes.outro.to;
