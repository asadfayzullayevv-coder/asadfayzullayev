import {B} from './beats';
import {Key, sample} from './keyframes';

export type PhoneState = {
  x: number;
  y: number;
  scale: number;
  rotY: number;
  rotX: number;
  opacity: number;
  blur: number;
};

const BASE: PhoneState = {x: 0, y: 0, scale: 1, rotY: 0, rotX: 0, opacity: 0, blur: 0};

/**
 * The handset's route through the world.
 *
 * It is mounted once and never re-created. Across the film it goes from a
 * speck behind the ring, to eye level, to half out of frame, to a macro so
 * close that a single chart segment fills the screen, and back. It is a hero
 * object with a trajectory, not a prop that gets re-placed each chapter.
 *
 * Hold keys are mandatory here: a channel named once before a chapter and
 * again after it drifts across everything in between (see keyframes.ts).
 */
const KEYS: Array<Key<PhoneState>> = [
  // A speck, far away, discovered through the ring.
  {frame: B.through, x: 0, y: 0, scale: 0.26, rotY: 0, rotX: 0, opacity: 0, blur: 16},
  {frame: B.phoneIn, opacity: 1},
  {frame: B.labelIn, x: 0, y: 0, scale: 1.0, blur: 0, rotY: 0},

  // Entertainment: drifts left and lets the frame edge crop it.
  {frame: B.labelOut, x: -40, scale: 1.0, rotY: 5, opacity: 1, blur: 0},
  // The product clears the frame entirely for the chapter's hero word and
  // comes back for the quiet line. A 12-letter Russian word cannot be both
  // enormous and share the frame with a phone; the product leaving is the
  // honest answer, and it is also the more expensive-looking one.
  {frame: B.razv, x: -620, y: 0, scale: 0.96, rotY: 11},
  {frame: B.razvOut, x: -1000, y: 20, scale: 0.92, rotY: 14},
  {frame: B.love, x: -160, y: 10, scale: 1.0, rotY: 6},
  {frame: B.pora, x: -40, y: 4, scale: 1.05, rotY: 2},
  // Passes behind the largest word of the chapter.
  {frame: B.porabotat + 40, x: 120, y: 20, scale: 1.12, rotY: -6},
  {frame: B.porabotatOut, x: 200, y: 30, scale: 1.15, rotY: -8, blur: 0, opacity: 1},

  // Food: all the way to macro, one segment filling the lens.
  {frame: B.greenPush, x: 60, y: -30, scale: 1.6, rotY: -3},
  {frame: B.produkty, x: 0, y: -50, scale: 3.6, rotY: 0, blur: 0},
  {frame: B.produktyOut, x: 0, y: -40, scale: 3.1},
  // …then far back, on the other side, at a new perspective.
  {frame: B.family, x: 330, y: 20, scale: 0.9, rotY: -13, blur: 0, opacity: 1},
  {frame: B.familyOut, x: 360, y: 30, scale: 0.94, rotY: -11},
  {frame: B.home, x: 300, y: 20, scale: 0.98, rotY: -7},
  {frame: B.krepost, x: 240, y: 10, scale: 1.0, rotY: -4},
  {frame: B.throughFrame, x: 0, y: 0, scale: 0.88, rotY: 0, blur: 4},

  // Custom category: the UI is the performance, so the device holds still-ish.
  {frame: B.sheetOpen + 20, x: 0, y: 0, scale: 1.0, blur: 0},
  {frame: B.created, x: 0, y: 0, scale: 1.02},
  // Shifted right so the anchored "КАЛЬЯН 67%" block has the left third to
  // itself: anchoring a number to a segment is worthless if the number then
  // collides with the device.
  {frame: B.kalyan, x: 90, y: 60, scale: 1.2, rotY: 3},
  {frame: B.kalyanOut, x: 120, y: 80, scale: 1.28, rotY: 5},
  {frame: B.sportOut, x: 0, y: 20, scale: 1.06, rotY: 2},
  // Slides behind the joke.
  {frame: B.joke + 40, x: 330, y: 30, scale: 0.96, rotY: -11},
  {frame: B.jokeOut, x: 380, y: 40, scale: 0.98, rotY: -9, blur: 0, opacity: 1},

  // The punchline.
  {frame: B.favSheet + 24, x: 0, y: 0, scale: 1.06, rotY: 0},
  {frame: B.favCreated, x: 0, y: 0, scale: 1.08},
  {frame: B.num, x: 110, y: 70, scale: 1.22, rotY: 2},
  {frame: B.numOut, x: 140, y: 90, scale: 1.3, rotY: 3, blur: 0, opacity: 1},
  // "Everything disappears except ОФИЦИАЛЬНО" — the product included.
  {frame: B.official, x: 0, y: 200, scale: 1.16, blur: 10, opacity: 0},
  {frame: B.fadeOut, opacity: 0},
];

export const phoneAt = (frame: number): PhoneState => sample(KEYS, BASE, frame);

/**
 * World position of the donut's centre.
 *
 * The chart sits 180 screen px above the middle of the handset, so anything
 * that has to be anchored to a segment — the camera, a percentage — can ask
 * for it instead of guessing.
 */
export const chartWorld = (frame: number) => {
  const p = phoneAt(frame);
  return {x: p.x, y: p.y - 180 * p.scale, scale: p.scale};
};
