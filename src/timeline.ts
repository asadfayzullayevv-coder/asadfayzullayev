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

/**
 * There are no scenes.
 *
 * The film is one take; what used to be a scene table now lives as moments in
 * beats.ts and as a camera path in world.ts. This export is only the length.
 */
export const TOTAL_FRAMES = sec(77);

