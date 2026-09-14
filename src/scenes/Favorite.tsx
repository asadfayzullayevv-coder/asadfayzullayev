import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CREATED_AT, shareAt} from '../data/categories';
import {clamp01, easeOutExpo, easeOutQuint, prog} from '../motion';
import {scenes} from '../timeline';
import {MaskReveal, TrackingIn, useExit} from '../type/kinetic';
import {Word} from '../type/Word';

const CREATED = CREATED_AT.favorite - scenes.favorite.from;
const T = {
  number: CREATED + 34,
  numberOut: CREATED + 112,
  na: CREATED + 132,
  naOut: CREATED + 196,
  official: CREATED + 224,
  punch: CREATED + 254,
  punchOut: CREATED + 350,
};

/**
 * 0:52–1:08 — the payoff.
 *
 * Everything here is built around one frame: the punchline. The number gets
 * the frame first, then a pause, then a small tracked label sets it up, and
 * only then the largest type in the film lands. The camera has already pushed
 * in and thrown the product out of focus behind it (see staging.ts), so the
 * joke reads as the subject rather than as a caption over a phone.
 */
export const Favorite: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = scenes.favorite.from + frame;
  const share = shareAt(abs, 'favorite');

  const numberOut = useExit(T.numberOut, 18);
  const naOut = useExit(T.naOut, 16);
  const punchOut = useExit(T.punchOut, 26);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* The share, read live off the chart, at a size no caption ever gets. */}
      {frame > T.number - 10 && frame < T.numberOut + 20 ? (
        <AbsoluteFill style={{zIndex: 5, ...numberOut.style}}>
          <div style={{position: 'absolute', left: 90, top: 300}}>
            <Word
              text={`${Math.round(share)}%`}
              size={330}
              weight={900}
              tone="fire"
              tracking="-0.06em"
              letterStyle={(i) => {
                const p = easeOutExpo(prog(frame, T.number + i * 3, 28));
                return {
                  opacity: clamp01(p * 1.4),
                  transform: `translateY(${(1 - p) * 130}px) scale(${0.86 + p * 0.14})`,
                  filter: p < 0.98 ? `blur(${(1 - p) * 30}px)` : undefined,
                };
              }}
            />
          </div>
          <div style={{position: 'absolute', left: 104, top: 630}}>
            <TrackingIn
              text="РАСХОДОВ"
              size={62}
              start={T.number + 20}
              duration={34}
              weight={600}
              fromTracking={0.5}
              toTracking={0.1}
            />
          </div>
        </AbsoluteFill>
      ) : null}

      {frame > T.na - 8 && frame < T.naOut + 18 ? (
        <div style={{position: 'absolute', right: 130, bottom: 260, zIndex: 20, ...naOut.style}}>
          <MaskReveal text="на «Любимую»…" size={96} start={T.na} duration={26} weight={700} />
        </div>
      ) : null}

      {frame > T.official - 8 ? (
        <AbsoluteFill style={{zIndex: 20, ...punchOut.style}}>
          <div style={{position: 'absolute', left: 132, top: 300}}>
            <TrackingIn
              text="ОФИЦИАЛЬНО:"
              size={44}
              start={T.official}
              duration={26}
              weight={700}
              tone="muted"
              fromTracking={0.6}
              toTracking={0.18}
            />
          </div>

          {/* The biggest type in the film, wider than the frame on purpose. */}
          {/* Stacked, and sized to reach both edges: the largest type in the
              film still has to be read in one glance. */}
          <div style={{position: 'absolute', left: 128, top: 350}}>
            <Word
              text="ВЫ"
              size={300}
              weight={900}
              tone="white"
              tracking="-0.05em"
              style={{
                opacity: clamp01(easeOutQuint(prog(frame, T.punch, 18)) * 1.5),
                transform: `translateY(${(1 - easeOutExpo(prog(frame, T.punch, 22))) * 80}px)`,
              }}
            />
          </div>
          <div style={{position: 'absolute', left: 22, top: 620}}>
            <Word
              text="ПОДКАБЛУЧНИК"
              size={226}
              weight={900}
              tone="fire"
              uppercase
              tracking="-0.055em"
              letterStyle={(i) => {
                const p = easeOutExpo(prog(frame, T.punch + 8 + i * 1.1, 22));
                return {
                  opacity: clamp01(p * 1.7),
                  transform: `translateY(${(1 - p) * 150}px) scale(${0.8 + p * 0.2})`,
                  filter: p < 0.97 ? `blur(${(1 - p) * 34}px)` : undefined,
                };
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              right: 60,
              top: 300,
              fontSize: 150,
              opacity: clamp01(easeOutQuint(prog(frame, T.punch + 26, 20))),
              transform: `rotate(${-8 + easeOutExpo(prog(frame, T.punch + 26, 26)) * 8}deg)`,
            }}
          >
            😏
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
