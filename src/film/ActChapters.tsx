import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Layer} from '../components/Layer';
import {B} from '../beats';
import {growthProgress, shareAt} from '../data/categories';
import {clamp01, easeInQuad, easeOutExpo, easeOutQuint, prog} from '../motion';
import {chartWorld} from '../phonePath';
import {Word} from '../type/Word';
import {beatAt} from './beat';
import {PHONE_Z} from './PhoneObject';

const FRONT = PHONE_Z + 30;
const BEHIND = PHONE_Z - 30;

/**
 * 0:12–0:41 — entertainment and food.
 *
 * Both chapters are written against the chart rather than beside it: the
 * orange segment's growth is the word's position, and the green segment's
 * growth is the frame the next word is revealed inside. The handset crosses
 * the composition twice and passes behind the largest word of the film so far.
 */
export const ActChapters: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Entertainment frame={frame} />
      <Food frame={frame} />
    </>
  );
};

const Entertainment: React.FC<{frame: number}> = ({frame}) => {
  const share = shareAt(frame, 'entertainment');
  const push = growthProgress(frame, 'entertainment');

  const mnogo = beatAt(frame, B.mnogo, B.razvOut - 40, 24, 18);
  const razv = beatAt(frame, B.razv, B.razvOut, 30, 22);
  const love = beatAt(frame, B.love, B.loveOut, 40, 20);
  const pora = beatAt(frame, B.pora, B.porabotat + 34, 24, 18);
  const work = beatAt(frame, B.porabotat, B.porabotatOut, 26, 22);
  const label = beatAt(frame, B.collapseLabel, B.greenPush + 10, 20, 16);

  return (
    <>
      {/* One aligned block, not two floating items: the small word and the
          hero word share a left edge and a single position, so the segment's
          growth moves the whole composition rather than scattering it. */}
      {mnogo.live || razv.live ? (
        <Layer
          frame={frame}
          x={325 + push * 900}
          y={-20}
          z={FRONT}
          parallax={1.12}
          opacity={Math.max(mnogo.opacity, razv.opacity)}
          blur={razv.exit * 16}
        >
          <div style={{textAlign: 'left'}}>
            <div style={{marginLeft: 10, opacity: mnogo.opacity}}>
              <Word text="много" size={62} weight={500} tone="white" tracking="0.02em" />
            </div>
            <div style={{marginTop: -4, opacity: razv.opacity}}>
              <Word
                text="РАЗВЛЕЧЕНИЙ?"
                // The share sets the size, the growth sets the position: the
                // chart is doing both jobs at once.
                size={150 + share * 1.3}
                weight={900}
                tone="fire"
                glow={0.55}
                uppercase
                tracking="-0.05em"
                letterStyle={(i) => {
                  const p = easeOutExpo(prog(frame, B.razv + i * 1.4, 26));
                  return {
                    opacity: clamp01(p * 1.5),
                    transform: `translateY(${(1 - p) * 90}px)`,
                    filter: p < 0.98 ? `blur(${(1 - p) * 22}px)` : undefined,
                  };
                }}
              />
            </div>
          </div>
        </Layer>
      ) : null}

      {/* The quiet. Almost nothing moves here, and that is the point. */}
      {love.live ? (
        <Layer
          frame={frame}
          x={330}
          y={130}
          z={FRONT}
          parallax={1.04}
          opacity={love.opacity}
          blur={(1 - love.enter) * 7 + love.exit * 10}
        >
          <Word
            text="Вы любите жить."
            size={58}
            weight={500}
            tone="white"
            tracking={`${0.34 - easeOutQuint(prog(frame, B.love, 52)) * 0.32}em`}
          />
        </Layer>
      ) : null}

      {pora.live ? (
        <Layer
          frame={frame}
          x={40}
          y={-150}
          z={BEHIND}
          parallax={0.92}
          opacity={pora.opacity}
          scale={1.08 - pora.enter * 0.08}
          blur={(1 - pora.enter) * 18 + pora.exit * 12}
        >
          <Word text="ПОРА" size={140} weight={900} tone="white" uppercase tracking="-0.04em" />
        </Layer>
      ) : null}

      {/* The chapter's peak. The handset crosses behind it while it is up. */}
      {work.live ? (
        <Layer
          frame={frame}
          x={0}
          y={30}
          z={FRONT}
          parallax={1.16}
          opacity={work.opacity}
          scale={1 - work.exit * 0.16}
          blur={work.exit * 20}
        >
          <Word
            text="ПОРАБОТАТЬ"
            size={214}
            weight={900}
            tone="fire"
            glow={0.6}
            uppercase
            tracking="-0.055em"
            letterStyle={(i) => {
              const p = easeOutExpo(prog(frame, B.porabotat + i * 1.3, 26));
              return {
                opacity: clamp01(p * 1.6),
                transform: `translateY(${(1 - p) * 120}px) scale(${0.9 + p * 0.1})`,
                filter: p < 0.98 ? `blur(${(1 - p) * 28}px)` : undefined,
              };
            }}
          />
        </Layer>
      ) : null}

      {/* …and collapses into a small label that carries into the next move,
          instead of simply switching off. */}
      {label.live ? (
        <Layer
          frame={frame}
          x={0}
          y={30}
          z={FRONT}
          parallax={1.16}
          opacity={label.opacity * 0.85}
        >
          <Word
            text="над собой"
            size={40}
            weight={500}
            tone="muted"
            tracking={`${0.05 + label.enter * 0.24}em`}
          />
        </Layer>
      ) : null}
    </>
  );
};

const Food: React.FC<{frame: number}> = ({frame}) => {
  const family = beatAt(frame, B.family, B.familyOut, 30, 20);
  const home = beatAt(frame, B.home, B.throughFrame, 36, 18);

  return (
    <>
      <GreenSurge frame={frame} />

      {family.live ? (
        <Layer
          frame={frame}
          x={-560}
          y={-40}
          z={FRONT}
          parallax={1.05}
          opacity={family.opacity}
          blur={(1 - family.enter) * 10 + family.exit * 12}
        >
          <div>
            <Word text="вы" size={62} weight={500} tone="white" style={{marginLeft: 6}} />
          </div>
          <div style={{marginTop: -12}}>
            <Word
              text="СЕМЕЙНЫЙ"
              size={168}
              weight={900}
              tone="fire"
              glow={0.5}
              uppercase
              tracking="-0.05em"
              letterStyle={(i) => {
                const p = easeOutQuint(prog(frame, B.family + 8 + i * 2, 28));
                return {opacity: clamp01(p * 1.5), transform: `translateY(${(1 - p) * 70}px)`};
              }}
            />
          </div>
          <div style={{marginTop: -6}}>
            <Word text="ЧЕЛОВЕК." size={86} weight={700} tone="white" uppercase tracking="-0.03em" />
          </div>
        </Layer>
      ) : null}

      {home.live ? <Krepost frame={frame} beat={home} /> : null}
    </>
  );
};

/**
 * The green segment coming at the lens.
 *
 * White type on the white card was invisible, and a chart segment is a thin
 * arc — it cannot "contain" a word. So the segment itself surges: a disc of
 * the category's own colour swells out of the chart until it owns the frame,
 * the word is knocked out of it, and then it recedes back into the chart as
 * the camera pulls out. The transition is made of the data it is about.
 */
const GreenSurge: React.FC<{frame: number}> = ({frame}) => {
  const chart = chartWorld(frame);
  const grow = easeOutQuint(prog(frame, B.greenPush + 14, 56));
  const recede = easeInQuad(prog(frame, B.produktyOut, 24));
  const cover = grow * (1 - recede);
  if (cover <= 0.002) return null;

  // The word wipes on, but fades off. Un-wiping it would leave a fragment of
  // letters hanging on the green for a beat, which looks like a glitch.
  const wipe = easeOutQuint(prog(frame, B.produkty, 30));
  const wordOut = 1 - easeInQuad(prog(frame, B.produktyOut - 8, 18));

  return (
    <>
      <Layer
        frame={frame}
        x={chart.x}
        y={chart.y}
        z={PHONE_Z + 20}
        // Parallax 1 on purpose: the camera is locked to the chart through
        // this beat, so any other depth would slide the surge off the point
        // it is supposed to be growing out of. The "toward camera" read comes
        // from the disc's own scale, not from depth.
        parallax={1}
        opacity={1}
        scale={0.04 + cover * 1.0}
      >
        <div
          style={{
            width: 2600,
            height: 2600,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 42% 36%, #45D183 0%, #2FBF71 46%, #1E9E5B 100%)',
          }}
        />
      </Layer>

      {wipe > 0.002 && wordOut > 0.002 ? (
        <Layer
          frame={frame}
          x={chart.x}
          y={chart.y}
          z={PHONE_Z + 22}
          parallax={1}
          opacity={wordOut}
        >
          <div style={{clipPath: `inset(0% ${(1 - wipe) * 100}% 0% 0%)`}}>
            <Word
              text="ПРОДУКТЫ"
              size={210}
              weight={900}
              tone="white"
              uppercase
              tracking="-0.05em"
            />
          </div>
        </Layer>
      ) : null}
    </>
  );
};

/**
 * The calm line, and the shape it becomes.
 *
 * "КРЕПОСТЬ" does not exit — it turns into a rectangle the camera then flies
 * through. The transition is made out of the thing that preceded it, which is
 * the rule the whole film is cut on.
 */
const Krepost: React.FC<{frame: number; beat: ReturnType<typeof beatAt>}> = ({frame, beat}) => {
  const toFrame = easeOutQuint(prog(frame, B.frameForm, 30));
  const gone = easeInQuad(prog(frame, B.frameForm, 22));

  return (
    <>
      <Layer
        frame={frame}
        x={-460}
        y={40}
        z={PHONE_Z + 30}
        parallax={1.04}
        opacity={beat.opacity * (1 - gone)}
        blur={(1 - beat.enter) * 8}
      >
        <div>
          <Word
            text="ДОМ —"
            size={54}
            weight={500}
            tone="muted"
            tracking={`${0.4 - easeOutQuint(prog(frame, B.home, 48)) * 0.34}em`}
          />
        </div>
        <div style={{marginTop: 2}}>
          <Word
            text="ВАША КРЕПОСТЬ"
            size={118}
            weight={800}
            tone="white"
            uppercase
            tracking="-0.04em"
          />
        </div>
      </Layer>

      {toFrame > 0.001 ? (
        <Layer
          frame={frame}
          x={-460 + toFrame * 460}
          y={40 - toFrame * 40}
          z={PHONE_Z + 60}
          // Nearer than anything else, so the camera's push takes it past the
          // lens and we end up on the other side of it.
          parallax={1.5}
          opacity={Math.min(1, toFrame * 2) * (1 - easeInQuad(prog(frame, B.throughFrame, 22)))}
        >
          <div
            style={{
              width: 300 + toFrame * 560,
              height: 150 + toFrame * 420,
              border: `${2 + toFrame * 2}px solid rgba(255,255,255,${0.5 - toFrame * 0.2})`,
              borderRadius: 10 + toFrame * 22,
            }}
          />
        </Layer>
      ) : null}
    </>
  );
};
