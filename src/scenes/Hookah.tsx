import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CREATED_AT, shareAt} from '../data/categories';
import {clamp01, easeOutExpo, easeOutQuint, prog} from '../motion';
import {scenes} from '../timeline';
import {MaskReveal, Punch, TrackingIn, useExit} from '../type/kinetic';
import {Word} from '../type/Word';

const CREATED = CREATED_AT.hookah - scenes.hookah.from;
const T = {
  hero: CREATED + 26,
  sport: CREATED + 92,
  heroOut: CREATED + 136,
  joke: CREATED + 168,
  jokeOut: CREATED + 288,
};

/**
 * 0:37.5–0:52 — the viewer watches a category get invented, then watches it
 * eat the chart.
 *
 * The handset holds the centre here because the UI is the performance: the
 * sheet, the caret, the confirm. Type stays behind and around it, and the
 * percentage is read live off the chart rather than hard-coded, so the number
 * on screen can never drift from the segment beside it.
 */
export const Hookah: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = scenes.hookah.from + frame;
  const share = shareAt(abs, 'hookah');
  const sportShare = shareAt(abs, 'sport');

  const heroOut = useExit(T.heroOut, 18);
  const jokeOut = useExit(T.jokeOut, 22);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* Behind the handset: the word is bigger than the product and the
          product is standing in front of it. */}
      {frame > T.hero - 10 && frame < T.heroOut + 20 ? (
        <AbsoluteFill style={{zIndex: 5, ...heroOut.style}}>
          <div style={{position: 'absolute', left: 62, top: 250}}>
            <Word
              text="КАЛЬЯН"
              size={186}
              weight={900}
              uppercase
              tracking="-0.05em"
              tone="ramp"
              letterStyle={(i) => {
                const p = easeOutExpo(prog(frame, T.hero + i * 2, 26));
                return {
                  color: '#14B8A6',
                  opacity: clamp01(p * 1.4),
                  transform: `translateY(${(1 - p) * 90}px)`,
                  filter: p < 0.98 ? `blur(${(1 - p) * 26}px)` : undefined,
                };
              }}
            />
          </div>

          {/* The number scales with the segment, past the frame edge. */}
          <div style={{position: 'absolute', right: 34, top: 430}}>
            <Word
              text={`${Math.round(share)}%`}
              size={120 + share * 2.6}
              weight={900}
              tone="fire"
              tracking="-0.05em"
              style={{
                opacity: clamp01(easeOutQuint(prog(frame, T.hero + 14, 24)) * 1.4),
              }}
            />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Supporting text is deliberately tiny — the joke is in the ratio. */}
      {frame > T.sport - 6 && frame < T.heroOut + 20 ? (
        <div style={{position: 'absolute', left: 130, bottom: 190, zIndex: 20, ...heroOut.style}}>
          <TrackingIn
            text={`СПОРТ — ${Math.round(sportShare)}%`}
            size={40}
            start={T.sport}
            duration={30}
            weight={600}
            tone="muted"
            fromTracking={0.45}
            toTracking={0.14}
          />
        </div>
      ) : null}

      {frame > T.joke - 8 ? (
        <AbsoluteFill style={{zIndex: 20, ...jokeOut.style}}>
          <div style={{position: 'absolute', left: 140, top: 230}}>
            <MaskReveal text="может," size={64} start={T.joke} duration={22} weight={500} />
          </div>
          <div style={{position: 'absolute', left: 140, top: 300}}>
            <Punch text="ПОРА ЗАНЯТЬСЯ" size={112} start={T.joke + 16} duration={22} tone="white" />
          </div>
          <div style={{position: 'absolute', left: 132, top: 400}}>
            <Word
              text="СПОРТОМ?"
              size={252}
              weight={900}
              tone="fire"
              uppercase
              tracking="-0.05em"
              letterStyle={(i) => {
                const p = easeOutExpo(prog(frame, T.joke + 34 + i * 1.6, 26));
                return {
                  opacity: clamp01(p * 1.5),
                  transform: `translateY(${(1 - p) * 110}px) scale(${0.88 + p * 0.12})`,
                  filter: p < 0.98 ? `blur(${(1 - p) * 28}px)` : undefined,
                };
              }}
            />
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
