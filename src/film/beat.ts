import {clamp01, easeInQuad, easeOutExpo, prog} from '../motion';

export type Beat = {
  /** 0 -> 1 entrance, eased out (fast start, long settle). */
  enter: number;
  /** 0 -> 1 exit, eased in (slow start, decisive finish). */
  exit: number;
  opacity: number;
  /** False once the element can be unmounted entirely. */
  live: boolean;
};

/**
 * One phrase's window on the film's single timeline.
 *
 * Entrance and exit ride different curves on purpose: ease-out on the way in
 * gives a phrase anticipation and a long settle, ease-in on the way out makes
 * it leave decisively instead of dissolving. Windows are written to overlap —
 * an exit is scheduled after the next entrance has already begun — because a
 * frame that empties between phrases is the thing that reads as a slide.
 */
export const beatAt = (
  frame: number,
  inAt: number,
  outAt: number,
  inDur = 28,
  outDur = 20,
): Beat => {
  const enter = easeOutExpo(prog(frame, inAt, inDur));
  const exit = easeInQuad(prog(frame, outAt, outDur));
  return {
    enter,
    exit,
    opacity: clamp01(enter) * (1 - exit),
    live: frame > inAt - 6 && exit < 1,
  };
};
