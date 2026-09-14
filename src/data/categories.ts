import {interpolate} from 'remotion';
import {easeOutBack, easeOutCubic} from '../motion';
import {ease} from '../theme';
import {scenes} from '../timeline';

export type CategoryId =
  | 'entertainment'
  | 'groceries'
  | 'transport'
  | 'cafe'
  | 'hookah'
  | 'sport'
  | 'favorite'
  | 'other';

export type Category = {
  id: CategoryId;
  label: string;
  color: string;
  /** Custom user-made categories get a badge in the list. */
  custom?: boolean;
  /** Frame at which the row appears in the list (custom categories only). */
  appearsAt?: number;
};

/**
 * Declaration order doubles as the tiebreak when two categories hold the
 * same share; on screen the list is ranked by value (see rowRanksAt).
 */
export const CATEGORIES: Category[] = [
  {id: 'entertainment', label: 'Развлечения', color: '#FF7A45'},
  {id: 'groceries', label: 'Продукты', color: '#2FBF71'},
  {id: 'transport', label: 'Транспорт', color: '#3B82F6'},
  {id: 'cafe', label: 'Кафе и рестораны', color: '#A855F7'},
  {
    id: 'hookah',
    label: 'Кальян',
    color: '#14B8A6',
    custom: true,
    appearsAt: scenes.hookah.from,
  },
  {id: 'sport', label: 'Спорт', color: '#FACC15'},
  {
    id: 'favorite',
    label: 'Любимая',
    // The punchline slice carries the brand red.
    color: '#C8102E',
    custom: true,
    appearsAt: scenes.favorite.from,
  },
  {id: 'other', label: 'Прочее', color: '#9CA3AF'},
];

export type Distribution = Record<CategoryId, number>;

const dist = (d: Partial<Distribution>): Distribution => ({
  entertainment: 0,
  groceries: 0,
  transport: 0,
  cafe: 0,
  hookah: 0,
  sport: 0,
  favorite: 0,
  other: 0,
  ...d,
});

/** Each state sums to 100. No two values tie inside one state. */
export const STATES = {
  base: dist({entertainment: 18, groceries: 22, transport: 16, cafe: 13, sport: 14, other: 17}),
  entertainment: dist({entertainment: 46, groceries: 14, transport: 11, cafe: 9, sport: 8, other: 12}),
  groceries: dist({entertainment: 12, groceries: 48, transport: 12, cafe: 8, sport: 9, other: 11}),
  hookah: dist({entertainment: 13, groceries: 19, transport: 10, cafe: 8, hookah: 37, sport: 2, other: 11}),
  favorite: dist({
    entertainment: 8,
    groceries: 13,
    transport: 5,
    cafe: 4,
    hookah: 7,
    sport: 1,
    favorite: 56,
    other: 6,
  }),
};

/** Monthly total the percentages are rendered against. */
export const MONTHLY_TOTAL = 12_480_000;
export const CURRENCY = 'UZS';

type Keyframe = {frame: number; state: Distribution};

/**
 * The chart morphs on a 3s ease so the eye can follow a single segment
 * growing, and holds long enough for the punchline to land.
 */
const MORPH = 90;
const LEAD_IN = 30;

export const CHART_KEYFRAMES: Keyframe[] = [
  {frame: scenes.reveal.from, state: STATES.base},
  {frame: scenes.entertainment.from + LEAD_IN, state: STATES.base},
  {frame: scenes.entertainment.from + LEAD_IN + MORPH, state: STATES.entertainment},
  {frame: scenes.groceries.from + LEAD_IN, state: STATES.entertainment},
  {frame: scenes.groceries.from + LEAD_IN + MORPH, state: STATES.groceries},
  {frame: scenes.hookah.from + LEAD_IN, state: STATES.groceries},
  {frame: scenes.hookah.from + LEAD_IN + MORPH, state: STATES.hookah},
  {frame: scenes.favorite.from + LEAD_IN, state: STATES.hookah},
  {frame: scenes.favorite.from + LEAD_IN + MORPH, state: STATES.favorite},
];

/** The distribution at any absolute frame of the film. */
export const distributionAt = (frame: number): Distribution => {
  const kfs = CHART_KEYFRAMES;
  if (frame <= kfs[0].frame) return kfs[0].state;
  const last = kfs[kfs.length - 1];
  if (frame >= last.frame) return last.state;

  let i = 0;
  while (i < kfs.length - 1 && frame > kfs[i + 1].frame) i++;
  const a = kfs[i];
  const b = kfs[i + 1];
  if (b.frame === a.frame) return b.state;

  const t = (frame - a.frame) / (b.frame - a.frame);
  const out = {} as Distribution;
  for (const c of CATEGORIES) {
    const from = a.state[c.id];
    const to = b.state[c.id];
    // A growing category overshoots its target and pulls back; the ones
    // giving up room ease in softly. Because the donut normalises by the
    // running total, that overshoot squeezes every other slice for free —
    // which is exactly the "one segment pushes, the rest give way" read.
    const eased = to > from ? easeOutBack(t, 1.4) : easeOutCubic(t);
    out[c.id] = from + (to - from) * eased;
  }
  return out;
};

/**
 * Row order for the category list.
 *
 * Rank is computed on the two keyframe states around `frame` and then
 * interpolated, so rows are always evenly spaced (unlike a continuous
 * "soft rank") yet still glide past each other during a morph instead of
 * jumping the instant two values cross.
 */
const rankIn = (state: Distribution, visible: CategoryId[]): Record<string, number> => {
  const sorted = [...visible].sort((a, b) => {
    const d = state[b] - state[a];
    if (Math.abs(d) > 1e-6) return d;
    // Deterministic tiebreak: declared order.
    return CATEGORIES.findIndex((c) => c.id === a) - CATEGORIES.findIndex((c) => c.id === b);
  });
  const out: Record<string, number> = {};
  sorted.forEach((id, i) => {
    out[id] = i;
  });
  return out;
};

export const rowRanksAt = (frame: number, visible: CategoryId[]): Record<string, number> => {
  const kfs = CHART_KEYFRAMES;
  if (frame <= kfs[0].frame) return rankIn(kfs[0].state, visible);
  const last = kfs[kfs.length - 1];
  if (frame >= last.frame) return rankIn(last.state, visible);

  let i = 0;
  while (i < kfs.length - 1 && frame > kfs[i + 1].frame) i++;
  const a = kfs[i];
  const b = kfs[i + 1];
  const ra = rankIn(a.state, visible);
  const rb = rankIn(b.state, visible);
  if (b.frame === a.frame) return rb;

  const out: Record<string, number> = {};
  for (const id of visible) {
    out[id] = interpolate(frame, [a.frame, b.frame], [ra[id], rb[id]], {
      easing: ease.inOut,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  return out;
};

/** Which slice is emphasised at a given frame, if any. */
export const focusAt = (frame: number): CategoryId | null => {
  const f = (s: {from: number; durationInFrames: number}) =>
    frame >= s.from + LEAD_IN && frame < s.from + s.durationInFrames;
  if (f(scenes.entertainment)) return 'entertainment';
  if (f(scenes.groceries)) return 'groceries';
  if (f(scenes.hookah)) return 'hookah';
  if (f(scenes.favorite)) return 'favorite';
  return null;
};

/** Rounded to the nearest hundred so mid-morph values still read as money. */
export const formatMoney = (amount: number) =>
  (Math.round(amount / 100) * 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
