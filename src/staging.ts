import {easeInOutCubicish} from './motion';
import {CREATED_AT} from './data/categories';
import {PHONE_LAYER, scenes} from './timeline';

export type Stage = {
  x: number;
  y: number;
  scale: number;
  rotY: number;
  blur: number;
  opacity: number;
};

type StageKey = Partial<Stage> & {frame: number};

const BASE: Stage = {x: 0, y: 0, scale: 1, rotY: 0, blur: 0, opacity: 1};

/**
 * The handset's whole journey, written as one list.
 *
 * Keeping every position in a single table is what lets the phone stay one
 * physical object for 69 seconds: there is no scene that "places" it, only a
 * camera that keeps moving around something already there. Transitions differ
 * on purpose — a push through a segment, a whip pan, a focus dip — because
 * repeating one move between every chapter is what makes an ad feel generated.
 */
const KEYS: StageKey[] = [
  // Emerging out of the ring the camera just flew through.
  // Every channel is seeded here: a field carries forward from its first
  // keyframe, so a channel first mentioned mid-film would otherwise hold that
  // later value from frame one.
  {frame: PHONE_LAYER.from, x: 0, y: 0, rotY: 0, scale: 2.1, blur: 30, opacity: 0},
  {frame: PHONE_LAYER.from + 22, scale: 1.45, blur: 12, opacity: 1},
  {frame: PHONE_LAYER.from + 58, scale: 1.0, blur: 0},
  {frame: scenes.reveal.from, scale: 1.0},
  {frame: scenes.reveal.to, scale: 1.05},

  // Entertainment: the handset yields the right half of the frame to type…
  {frame: scenes.entertainment.from + 65, x: -420, scale: 0.98, rotY: 7},
  {frame: scenes.entertainment.from + 215, x: -420, scale: 1.04, rotY: 5},
  // …and then crosses to the other side, so the closing phrase gets the
  // width it needs and the chapter never settles into one composition.
  {frame: scenes.entertainment.from + 271, x: 430, scale: 1.0, rotY: -7},
  // Holding blur and opacity here matters: without a hold, a channel keyed
  // only at the next transition would start drifting toward it from the last
  // time it was mentioned — half a chapter early.
  {frame: scenes.entertainment.to - 32, x: 430, scale: 1.12, rotY: -3, blur: 0, opacity: 1},
  // …then the camera flies straight through the orange segment.
  {frame: scenes.entertainment.to, x: 300, scale: 3.2, blur: 26, opacity: 0},

  // Groceries arrives from the other side of that move.
  {frame: scenes.groceries.from + 6, x: 340, scale: 1.55, blur: 20, opacity: 0},
  {frame: scenes.groceries.from + 44, x: 330, scale: 1.0, blur: 0, opacity: 1, rotY: -6},
  {frame: scenes.groceries.to - 45, x: 330, scale: 1.07, rotY: -4, blur: 0, opacity: 1},
  // Whip pan into the custom-category chapter — a different move on purpose.
  {frame: scenes.groceries.to - 7, x: -90, scale: 1.0, blur: 14, rotY: 10},

  // Hookah: the phone owns the centre, because the UI itself is the action.
  {frame: scenes.hookah.from + 15, x: 0, scale: 1.08, blur: 0, rotY: 0},
  // The joke needs the left two thirds, so the handset steps aside for it.
  {frame: CREATED_AT.hookah + 150, x: 0, scale: 1.12},
  {frame: CREATED_AT.hookah + 200, x: 430, scale: 1.0, rotY: -7},
  {frame: scenes.hookah.to - 40, x: 430, scale: 1.06, rotY: -5, blur: 0, opacity: 1},
  // Focus dip instead of a cut.
  {frame: scenes.favorite.from, x: 180, scale: 0.98, blur: 6, rotY: 0},
  {frame: scenes.favorite.from + 26, x: 0, scale: 1.06, blur: 0},
  {frame: CREATED_AT.favorite + 40, x: 0, scale: 1.14, blur: 0},

  // The punchline: the camera closes in and the product falls out of focus
  // behind the type. Depth of field is what keeps the joke readable.
  {frame: scenes.favorite.to - 134, x: 0, y: 40, scale: 1.26, blur: 0},
  // Out of focus before the punchline finishes drawing, not after: the joke
  // must never share sharpness with the UI behind it.
  {frame: scenes.favorite.to - 104, x: 0, y: 150, scale: 1.34, blur: 8},
  {frame: scenes.favorite.to - 10, y: 150, scale: 1.34, blur: 7, opacity: 1},

  // Outro: pull back to a clean, balanced frame.
  {frame: scenes.outro.from + 40, x: 0, y: 30, scale: 0.9, blur: 0},
  {frame: scenes.outro.from + 150, y: 20, scale: 0.84, blur: 0, opacity: 1},
  {frame: scenes.outro.from + 200, y: 20, scale: 0.82, opacity: 0, blur: 8},
];

const FIELDS: Array<keyof Stage> = ['x', 'y', 'scale', 'rotY', 'blur', 'opacity'];

/**
 * Resolve the sparse table above into a full transform.
 *
 * Each field carries forward independently, so a keyframe only has to state
 * what it changes — the same way a real animator keys one channel at a time.
 */
export const stageAt = (frame: number): Stage => {
  const out = {...BASE};

  for (const field of FIELDS) {
    const keys = KEYS.filter((k) => k[field] !== undefined) as Array<
      {frame: number} & Record<string, number>
    >;
    if (keys.length === 0) continue;

    if (frame <= keys[0].frame) {
      out[field] = keys[0][field];
      continue;
    }
    const last = keys[keys.length - 1];
    if (frame >= last.frame) {
      out[field] = last[field];
      continue;
    }
    let i = 0;
    while (i < keys.length - 1 && frame > keys[i + 1].frame) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const t = b.frame === a.frame ? 1 : (frame - a.frame) / (b.frame - a.frame);
    out[field] = a[field] + (b[field] - a[field]) * easeInOutCubicish(t);
  }

  return out;
};
