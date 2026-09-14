import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {growthProgress, shareAt} from '../data/categories';
import {clamp01, easeOutExpo, easeOutQuint, prog} from '../motion';
import {scenes} from '../timeline';
import {MaskReveal, TrackingIn, useExit} from '../type/kinetic';
import {Word} from '../type/Word';

const T = {
  lead: 24,
  hero: 44,
  heroOut: 132,
  family: 152,
  familyOut: 218,
  home: 242,
  homeOut: 312,
};

/**
 * 0:26–0:37.5 — the handset swaps to the right, so the eye has to travel.
 *
 * The green segment doesn't just grow next to the word: its growth is wired
 * straight into the word's position, shoving the whole phrase leftward out of
 * the frame. The interface wins the argument with the typography.
 */
export const Groceries: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = scenes.groceries.from + frame;
  const share = shareAt(abs, 'groceries');
  const push = growthProgress(abs, 'groceries');

  const headOut = useExit(T.heroOut, 18);
  const familyOut = useExit(T.familyOut, 16);
  const homeOut = useExit(T.homeOut, 20);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {frame < T.heroOut + 20 ? (
        <div
          style={{
            position: 'absolute',
            left: 110,
            top: 290,
            zIndex: 20,
            // Pushed away by the expanding segment.
            opacity: headOut.opacity,
            filter: headOut.filter,
            transform: `translate(${-push * 170}px, ${headOut.y}px) scale(${headOut.scale})`,
          }}
        >
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
            <MaskReveal text="много" size={52} start={T.lead} duration={20} weight={500} />
            <MaskReveal text="тратите на" size={52} start={T.lead + 6} duration={20} weight={500} />
          </div>
          <div style={{marginTop: 6}}>
            <Word
              text="ПРОДУКТЫ?"
              size={96 + share * 1.6}
              weight={900}
              // Tinted to the segment it belongs to — the word is the category.
              tone="ramp"
              uppercase
              tracking="-0.04em"
              style={{color: '#2FBF71'}}
              letterStyle={(i) => {
                const p = easeOutExpo(prog(frame, T.hero + i * 1.5, 26));
                return {
                  color: '#2FBF71',
                  opacity: clamp01(p * 1.5),
                  transform: `translateY(${(1 - p) * 80}px)`,
                  filter: p < 0.98 ? `blur(${(1 - p) * 22}px)` : undefined,
                };
              }}
            />
          </div>
        </div>
      ) : null}

      {frame > T.family - 6 && frame < T.familyOut + 18 ? (
        <div style={{position: 'absolute', left: 130, top: 380, zIndex: 20, ...familyOut.style}}>
          <div>
            <MaskReveal text="вы" size={64} start={T.family} duration={20} weight={500} />
          </div>
          <div style={{marginTop: -8}}>
            <Word
              text="СЕМЕЙНЫЙ"
              size={168}
              weight={900}
              tone="fire"
              uppercase
              tracking="-0.045em"
              letterStyle={(i) => {
                const p = easeOutQuint(prog(frame, T.family + 10 + i * 2, 26));
                return {
                  opacity: clamp01(p * 1.5),
                  transform: `translateY(${(1 - p) * 70}px)`,
                };
              }}
            />
          </div>
          <div style={{marginTop: -4}}>
            <MaskReveal text="человек." size={84} start={T.family + 26} duration={22} weight={700} />
          </div>
        </div>
      ) : null}

      {/* The calm beat before the film accelerates again. */}
      {frame > T.home - 6 ? (
        <div style={{position: 'absolute', left: 130, top: 470, zIndex: 20, ...homeOut.style}}>
          <TrackingIn
            text="ДОМ — ВАША КРЕПОСТЬ."
            size={58}
            start={T.home}
            duration={44}
            weight={600}
            fromTracking={0.5}
            toTracking={0.06}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
