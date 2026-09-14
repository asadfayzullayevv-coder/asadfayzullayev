import {B} from './beats';
import {Key, sample} from './keyframes';
import {clamp01, drift} from './motion';
import {chartWorld} from './phonePath';

/**
 * The film is one continuous take through a single world.
 *
 * Objects hold world coordinates; the camera holds a position and a zoom; and
 * what reaches the screen is the projection of the two. "Scenes" are stretches
 * of one camera path, not containers — which is the structural reason nothing
 * can reset between chapters. A cut would require the path to jump, and it
 * never does.
 */
export type Cam = {x: number; y: number; zoom: number; rot: number};

const CAM_BASE: Cam = {x: 0, y: 0, zoom: 1, rot: 0};

/**
 * The camera path.
 *
 * Read it top to bottom and it is the whole film: a slow press into the
 * opening line, a hard drive into the hero word, a pull back as that word
 * becomes a ring, a travel through the ring onto the product, then a
 * continuous orbit that never once parks.
 */
const CAM: Array<Key<Cam>> = [
  {frame: 0, x: 0, y: 0, zoom: 1.0, rot: 0},
  // Barely perceptible press while the question sits.
  {frame: B.knowOut, zoom: 1.14},
  // Drive into the hero word until its letters are past both edges.
  {frame: B.compress, x: 0, y: 0, zoom: 3.5},
  // Pull back as the word crushes: we discover the ring rather than being
  // shown it.
  {frame: B.ringForm + 26, zoom: 1.18},
  // Travel through the ring. The ring sits closer to camera than the handset,
  // so the same zoom throws it past the lens while the product only grows.
  {frame: B.through, zoom: 1.3},
  {frame: B.phoneIn + 26, zoom: 2.6},
  {frame: B.labelIn, x: 0, y: 0, zoom: 1.0},

  // Entertainment: lateral drift, then follow the orange segment outward.
  {frame: B.labelOut, x: 120, y: -10, zoom: 1.04, rot: -0.4},
  {frame: B.razv, x: 290, y: 10, zoom: 1.1},
  {frame: B.razvOut, x: 470, y: 30, zoom: 1.24, rot: -0.9},
  // Quiet: the camera slows almost to a stop, which is what makes the next
  // impact read as loud.
  {frame: B.love, x: 300, y: 20, zoom: 1.06, rot: -0.4},
  {frame: B.loveOut, x: 250, y: 16, zoom: 1.03},
  {frame: B.pora, x: 180, y: 6, zoom: 1.05},
  {frame: B.porabotat + 40, x: -60, y: -10, zoom: 1.16, rot: 0.5},
  {frame: B.porabotatOut, x: -150, y: -20, zoom: 1.22, rot: 0.3},

  // Food: push into the green segment until it owns the frame, then pull out.
  // Most of the magnification is the handset's own scale, not zoom — that way
  // the macro reads as the camera closing distance rather than cropping in.
  {frame: B.greenPush, x: -40, y: -150, zoom: 1.25},
  {frame: B.produkty, x: 0, y: -190, zoom: 1.42},
  {frame: B.produktyOut, x: 0, y: -140, zoom: 1.34},
  {frame: B.family, x: -260, y: -20, zoom: 0.94, rot: 0.7},
  {frame: B.familyOut, x: -300, y: 0, zoom: 0.98},
  {frame: B.home, x: -220, y: 20, zoom: 1.0, rot: 0.3},
  {frame: B.krepost, x: -120, y: 20, zoom: 1.02},
  // Through the geometric frame the last word turns into.
  {frame: B.throughFrame, x: 0, y: 0, zoom: 2.3, rot: 0},

  // Custom category: settle onto the device for the UI beat.
  {frame: B.sheetOpen + 20, x: 0, y: 40, zoom: 1.22},
  {frame: B.created, x: 0, y: 30, zoom: 1.24},
  // Follow the growing segment.
  {frame: B.kalyan, x: 40, y: -110, zoom: 1.35},
  {frame: B.kalyanOut, x: 90, y: -130, zoom: 1.44},
  {frame: B.sportOut, x: 30, y: -40, zoom: 1.16},
  {frame: B.joke + 40, x: -230, y: 20, zoom: 1.0, rot: -0.5},
  {frame: B.jokeOut, x: -300, y: 30, zoom: 1.04, rot: -0.3},

  // The punchline: close, quiet, centred.
  {frame: B.favSheet + 24, x: 0, y: 40, zoom: 1.2, rot: 0},
  {frame: B.favCreated, x: 0, y: 30, zoom: 1.22},
  {frame: B.num, x: 0, y: -60, zoom: 1.34},
  {frame: B.numOut, x: 0, y: -70, zoom: 1.42},
  {frame: B.official, x: 0, y: 0, zoom: 1.0},
  {frame: B.punch, x: 0, y: 0, zoom: 1.0},
  {frame: B.punchOut, x: 0, y: 0, zoom: 1.06},

  // Ending: pull away.
  {frame: B.logo, x: 0, y: 0, zoom: 1.0},
  {frame: B.fadeOut, x: 0, y: 0, zoom: 0.88},
];

/**
 * Stretches where the camera stops following its own path and looks at the
 * chart instead.
 *
 * Written as [fade-in, hold-from, hold-to, fade-out, weight]. Aiming at the
 * live chart position rather than at numbers copied out of the phone table
 * means the two can never fall out of sync when either is retimed — and it is
 * what makes "the camera follows the growing segment" literally true.
 */
const LOOK_AT_CHART: Array<[number, number, number, number, number]> = [
  [B.greenPush - 46, B.greenPush, B.produktyOut, B.produktyOut + 46, 1],
  [B.hookahGrow, B.kalyan, B.kalyanOut, B.sportOut, 0.85],
  [B.favGrow, B.num, B.numOut, B.numOut + 40, 0.9],
];

const lookWeight = (frame: number) => {
  let w = 0;
  for (const [a, b, c, d, peak] of LOOK_AT_CHART) {
    if (frame <= a || frame >= d) continue;
    const ramp =
      frame < b ? clamp01((frame - a) / (b - a)) : frame > c ? clamp01((d - frame) / (d - c)) : 1;
    // Smoothstep so the camera eases onto the target instead of snapping to it.
    w = Math.max(w, peak * ramp * ramp * (3 - 2 * ramp));
  }
  return w;
};

export const cameraAt = (frame: number): Cam => {
  const cam = sample(CAM, CAM_BASE, frame);

  const look = lookWeight(frame);
  if (look > 0) {
    const target = chartWorld(frame);
    cam.x += (target.x - cam.x) * look;
    cam.y += (target.y - cam.y) * look;
  }

  // A hand on the head, never a mechanism: three incommensurate sines.
  return {
    x: cam.x + drift(frame, 1.2) * 7,
    y: cam.y + drift(frame, 4.7) * 5,
    zoom: cam.zoom * (1 + drift(frame, 9.4) * 0.004),
    rot: cam.rot + drift(frame, 8.3) * 0.16,
  };
};

export type Placed = {x: number; y: number; scale: number; rot: number};

/**
 * Project a world point onto the screen.
 *
 * `parallax` is the layer's depth: 1 sits with the product, above 1 is nearer
 * the lens and so moves and grows faster, below 1 hangs back. This is what
 * lets the camera fly *through* something — the near object outruns the frame
 * while whatever is behind it merely approaches.
 */
export const project = (cam: Cam, wx: number, wy: number, parallax = 1): Placed => {
  const zoom = 1 + (cam.zoom - 1) * parallax;
  return {
    x: (wx - cam.x * parallax) * zoom,
    y: (wy - cam.y * parallax) * zoom,
    scale: zoom,
    rot: cam.rot * parallax,
  };
};

export const placedTransform = (p: Placed, extraScale = 1) =>
  `translate(-50%, -50%) translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg) scale(${p.scale * extraScale})`;
