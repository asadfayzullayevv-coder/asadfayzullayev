/**
 * Single source of truth for the film's timing.
 *
 * The cut is written in seconds, but every accent (text hit, segment pop,
 * logo stamp) is snapped to the musical grid, so re-syncing to the real
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
  /** The drop after the intro — the phone reveal is cut to land on it. */
  dropSec: 10,
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
};

const build = (spec: Array<[string, number, number]>): Record<string, Scene> => {
  const out: Record<string, Scene> = {};
  for (const [id, fromSec, toSec] of spec) {
    out[id] = {id, from: sec(fromSec), durationInFrames: sec(toSec) - sec(fromSec)};
  }
  return out;
};

export const scenes = build([
  ['intro', 0, 10],
  ['reveal', 10, 22],
  ['entertainment', 22, 32],
  ['groceries', 32, 42],
  ['hookah', 42, 52],
  ['favorite', 52, 62],
  ['outro', 62, 66],
]);

/** The phone is one continuous layer from the reveal to the outro. */
export const PHONE_LAYER = {
  from: scenes.reveal.from,
  durationInFrames: scenes.outro.from + scenes.outro.durationInFrames - scenes.reveal.from,
};

export const TOTAL_FRAMES = scenes.outro.from + scenes.outro.durationInFrames;
