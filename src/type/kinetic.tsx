import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SPRING, clamp01, easeInQuad, easeOutCubic, easeOutExpo, easeOutQuint, prog} from '../motion';
import {Word, WordProps} from './Word';

/** Deterministic pseudo-random in [-1, 1] — same every render, no seeds to thread. */
const rand = (i: number, salt = 0) => {
  const x = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

type Timed = {start: number; duration?: number};

/**
 * Words fall in from different depths and positions and snap into one
 * composition — not a queue entering from the left.
 */
export const Assemble: React.FC<
  Timed & {
    words: string[];
    size: number;
    tracking?: string;
    tone?: WordProps['tone'];
    gap?: number;
    /** Frames between word arrivals. Small values read as a single snap. */
    stagger?: number;
  }
> = ({words, size, start, duration = 30, tracking = '0.34em', tone = 'white', gap = 0.34, stagger = 3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div style={{display: 'flex', gap: size * gap, alignItems: 'baseline'}}>
      {words.map((w, i) => {
        const s = spring({
          frame: frame - start - i * stagger,
          fps,
          config: SPRING.land,
          durationInFrames: duration,
        });
        const vis = easeOutCubic(prog(frame, start + i * stagger, duration * 0.6));
        // Each word arrives from its own depth and offset.
        const dz = 260 + rand(i) * 200;
        const dx = rand(i, 1) * 90;
        const dy = rand(i, 2) * 70;

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translate3d(${(1 - s) * dx}px, ${(1 - s) * dy}px, ${(1 - s) * -dz}px) scale(${0.7 + s * 0.3})`,
              opacity: clamp01(vis),
              filter: vis < 0.99 ? `blur(${(1 - vis) * 12}px)` : undefined,
            }}
          >
            <Word text={w} size={size} weight={600} tone={tone} tracking={tracking} uppercase />
          </span>
        );
      })}
    </div>
  );
};

/**
 * A word that grows to own the frame while its tracking collapses — the
 * optical signature of a headline being pushed toward the viewer.
 */
export const HeroScale: React.FC<
  Timed & {
    text: string;
    fromSize: number;
    toSize: number;
    tone?: WordProps['tone'];
    weight?: number;
  }
> = ({text, fromSize, toSize, start, duration = 26, tone = 'fire', weight = 900}) => {
  const frame = useCurrentFrame();
  const p = easeOutExpo(prog(frame, start, duration));
  const size = fromSize + (toSize - fromSize) * p;
  const tracking = `${0.12 - 0.15 * p}em`;

  return (
    <Word
      text={text}
      size={size}
      weight={weight}
      tone={tone}
      tracking={tracking}
      uppercase
      letterStyle={(i, n) => {
        // Letters at the ends lag a touch, so the word stretches as it grows.
        const edge = Math.abs(i - (n - 1) / 2) / Math.max(1, (n - 1) / 2);
        const lp = easeOutQuint(prog(frame, start + edge * 4, duration));
        return {opacity: clamp01(lp * 1.4), transform: `translateY(${(1 - lp) * size * 0.12}px)`};
      }}
    />
  );
};

/**
 * A slam: the word arrives oversized and settles onto its mark. Reserved for
 * the two or three moments that carry the joke.
 */
export const Punch: React.FC<
  Timed & {
    text: string;
    size: number;
    tone?: WordProps['tone'];
    weight?: number;
    /** How far past final size the word starts. */
    overshoot?: number;
  }
> = ({text, size, start, duration = 22, tone = 'white', weight = 900, overshoot = 1.32}) => {
  const frame = useCurrentFrame();
  const p = easeOutExpo(prog(frame, start, duration));
  const vis = easeOutCubic(prog(frame, start, duration * 0.35));

  return (
    <Word
      text={text}
      size={size}
      weight={weight}
      tone={tone}
      uppercase
      style={{
        transform: `scale(${overshoot - (overshoot - 1) * p})`,
        opacity: clamp01(vis),
        filter: vis < 0.99 ? `blur(${(1 - vis) * 26}px)` : undefined,
      }}
    />
  );
};

/** Revealed by a wipe rather than a fade — the edge does the work. */
export const MaskReveal: React.FC<
  Timed & {
    text: string;
    size: number;
    tone?: WordProps['tone'];
    weight?: number;
    direction?: 'up' | 'right';
  }
> = ({text, size, start, duration = 26, tone = 'white', weight = 800, direction = 'up'}) => {
  const frame = useCurrentFrame();
  const p = easeOutQuint(prog(frame, start, duration));
  const inset =
    direction === 'up' ? `${(1 - p) * 105}% 0% 0% 0%` : `0% ${(1 - p) * 100}% 0% 0%`;

  return (
    <span style={{display: 'inline-block', clipPath: `inset(${inset})`, overflow: 'hidden'}}>
      <Word
        text={text}
        size={size}
        weight={weight}
        tone={tone}
        uppercase
        style={{transform: `translateY(${(1 - p) * size * 0.24}px)`}}
      />
    </span>
  );
};

/** Wide tracking collapsing to tight — quiet, editorial, for supporting lines. */
export const TrackingIn: React.FC<
  Timed & {
    text: string;
    size: number;
    tone?: WordProps['tone'];
    weight?: number;
    fromTracking?: number;
    toTracking?: number;
  }
> = ({
  text,
  size,
  start,
  duration = 36,
  tone = 'white',
  weight = 500,
  fromTracking = 0.4,
  toTracking = 0.01,
}) => {
  const frame = useCurrentFrame();
  const p = easeOutQuint(prog(frame, start, duration));
  const vis = easeOutCubic(prog(frame, start, duration * 0.5));

  return (
    <Word
      text={text}
      size={size}
      weight={weight}
      tone={tone}
      tracking={`${fromTracking + (toTracking - fromTracking) * p}em`}
      style={{opacity: clamp01(vis)}}
      letterStyle={(i) => ({
        filter: vis < 0.99 ? `blur(${(1 - vis) * 6 * (0.5 + Math.abs(rand(i)))}px)` : undefined,
      })}
    />
  );
};

/**
 * Typed character by character with a blinking caret.
 *
 * `now` overrides the local clock: this renders inside the handset's own
 * Sequence, whose frame 0 is not the film's, and the typing has to line up
 * with absolute story beats.
 */
export const TypeCursor: React.FC<
  Timed & {
    text: string;
    size: number;
    color?: string;
    caretColor?: string;
    framesPerChar?: number;
    now?: number;
  }
> = ({text, size, start, color = '#0B0F19', caretColor = '#C8102E', framesPerChar = 4, now}) => {
  const local = useCurrentFrame();
  const frame = now ?? local;
  const shown = Math.max(0, Math.min(text.length, Math.floor((frame - start) / framesPerChar)));
  const caretOn = Math.floor(frame / 8) % 2 === 0 || frame < start + text.length * framesPerChar;

  return (
    <span style={{display: 'inline-flex', alignItems: 'center', fontSize: size, color}}>
      <span style={{whiteSpace: 'pre'}}>{text.slice(0, shown)}</span>
      <span
        style={{
          display: 'inline-block',
          width: 2,
          height: size * 1.15,
          marginLeft: 2,
          background: caretColor,
          opacity: caretOn ? 1 : 0,
        }}
      />
    </span>
  );
};

/**
 * Lifts a phrase away to clear the frame for the next impact.
 *
 * Returns the raw channels as well as a ready style, so a caller that needs
 * its own transform (a phrase being shoved by the UI, say) can compose rather
 * than fight it.
 */
export const useExit = (start: number, duration = 18) => {
  const frame = useCurrentFrame();
  const p = easeInQuad(prog(frame, start, duration));
  const y = -p * 40;
  const scale = 1 - p * 0.05;
  const opacity = 1 - p;
  const filter = p > 0.01 ? `blur(${p * 14}px)` : undefined;
  return {
    p,
    y,
    scale,
    opacity,
    filter,
    gone: p >= 1,
    style: {opacity, filter, transform: `translateY(${y}px) scale(${scale})`} as React.CSSProperties,
  };
};
