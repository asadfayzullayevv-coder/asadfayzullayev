import {easeInOutCubicish} from './motion';

export type Channels = Record<string, number>;
export type Key<T extends Channels> = Partial<T> & {frame: number};

/**
 * Sample a sparse keyframe table.
 *
 * Each channel is interpolated independently against only the keys that
 * mention it, so a table can key one property at a time the way an animator
 * would. The trap that follows from that: a channel named at frame 100 and
 * again at frame 900 drifts across all 800 frames between them. Where a value
 * must stay put, the table has to say so with a hold key. Every table in this
 * project is written with that in mind.
 */
export const sample = <T extends Channels>(
  keys: Array<Key<T>>,
  base: T,
  frame: number,
  easing: (t: number) => number = easeInOutCubicish,
): T => {
  const out: Channels = {...base};

  for (const field of Object.keys(base)) {
    const track = keys.filter((k) => (k as Channels)[field] !== undefined);
    if (track.length === 0) continue;

    const valueAt = (k: Key<T>) => (k as unknown as Channels)[field];

    if (frame <= track[0].frame) {
      out[field] = valueAt(track[0]);
      continue;
    }
    const last = track[track.length - 1];
    if (frame >= last.frame) {
      out[field] = valueAt(last);
      continue;
    }

    let i = 0;
    while (i < track.length - 1 && frame > track[i + 1].frame) i++;
    const a = track[i];
    const b = track[i + 1];
    const t = b.frame === a.frame ? 1 : (frame - a.frame) / (b.frame - a.frame);
    out[field] = valueAt(a) + (valueAt(b) - valueAt(a)) * easing(t);
  }

  return out as T;
};
