import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {shareAt} from '../data/categories';
import {clamp01, easeOutExpo, prog} from '../motion';
import {scenes} from '../timeline';
import {MaskReveal, Punch, TrackingIn, useExit} from '../type/kinetic';
import {Word} from '../type/Word';

const T = {
  mnogo: 8,
  hero: 26,
  heroOut: 96,
  love: 112,
  loveOut: 162,
  noPora: 190,
  work: 232,
  allOut: 336,
};

/**
 * 0:13.5–0:26 — the handset holds the left third, the type takes everything
 * else and then some.
 *
 * Four phrases, four different mechanics, three different scales. The hero
 * word is sized by the live chart value, so when the orange segment grows the
 * word grows with it — one motion system, not two.
 */
export const Entertainment: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = scenes.entertainment.from + frame;
  const share = shareAt(abs, 'entertainment');

  const headOut = useExit(T.heroOut, 18);
  const loveOut = useExit(T.loveOut, 16);
  const poraOut = useExit(T.work + 8, 16);
  const tailOut = useExit(T.allOut, 22);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* «МНОГО» / «РАЗВЛЕЧЕНИЙ?» — the second word is bound to the segment. */}
      {frame < T.heroOut + 20 ? (
        <div style={{position: 'absolute', left: 740, top: 320, zIndex: 20, ...headOut.style}}>
          <div style={{marginLeft: 44}}>
            <MaskReveal text="МНОГО" size={86} start={T.mnogo} duration={24} weight={600} />
          </div>
          <div style={{marginTop: 10}}>
            <Word
              text="РАЗВЛЕЧЕНИЙ?"
              // 18% -> 46% of the chart reads as 115px -> 144px of type.
              // Sized to reach the frame edge and no further: spilling past it
              // is the intent, losing a syllable is a bug.
              size={96 + share * 1.05}
              weight={900}
              tone="fire"
              uppercase
              tracking="-0.05em"
              letterStyle={(i) => {
                const p = easeOutExpo(prog(frame, T.hero + i * 1.6, 26));
                return {
                  opacity: clamp01(p * 1.5),
                  transform: `translateY(${(1 - p) * 70}px)`,
                  filter: p < 0.98 ? `blur(${(1 - p) * 20}px)` : undefined,
                };
              }}
            />
          </div>
        </div>
      ) : null}

      {/* A quiet, tracked line — the contrast that makes the next hit land. */}
      {frame > T.love - 4 && frame < T.loveOut + 18 ? (
        <div style={{position: 'absolute', left: 760, top: 470, zIndex: 20, ...loveOut.style}}>
          <TrackingIn text="Вы любите жить." size={62} start={T.love} duration={38} weight={500} />
        </div>
      ) : null}

      {/* «НО ПОРА» is placed so the handset covers its opening letters: the
          phrase literally emerges from behind the product. */}
      {/* Placed on the layer *below* the handset (z 5 against the phone's 10):
          the phrase is physically behind the product, not captioning it. */}
      {frame > T.noPora - 4 && frame < T.work + 30 ? (
        <AbsoluteFill style={{zIndex: 5}}>
          <div style={{position: 'absolute', left: 200, top: 250, ...poraOut.style}}>
            <Punch text="НО ПОРА" size={186} start={T.noPora} duration={24} tone="white" />
          </div>
        </AbsoluteFill>
      ) : null}

      {frame > T.work - 8 ? (
        <>
          {/* One block, three sizes. Hierarchy inside a single sentence is the
              whole brief in miniature. */}
          <div style={{position: 'absolute', left: 130, top: 440, zIndex: 20, ...tailOut.style}}>
            <div>
              <MaskReveal
                text="чуть-чуть"
                size={48}
                start={T.work}
                duration={22}
                weight={500}
                direction="right"
              />
            </div>
            <div style={{marginTop: -6}}>
              <Word
                text="ПОРАБОТАТЬ"
                size={189}
                weight={900}
                tone="fire"
                uppercase
                tracking="-0.045em"
                letterStyle={(i) => {
                  const p = easeOutExpo(prog(frame, T.work + 12 + i * 1.4, 24));
                  return {
                    opacity: clamp01(p * 1.6),
                    transform: `translateY(${(1 - p) * 90}px) scale(${0.9 + p * 0.1})`,
                    filter: p < 0.98 ? `blur(${(1 - p) * 24}px)` : undefined,
                  };
                }}
              />
            </div>
            <div style={{marginTop: 4}}>
              <MaskReveal text="над собой." size={72} start={T.work + 30} duration={24} weight={600} />
            </div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
