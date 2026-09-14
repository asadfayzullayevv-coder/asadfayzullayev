import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Layer} from '../components/Layer';
import {Logo} from '../components/Logo';
import {B} from '../beats';
import {shareAt} from '../data/categories';
import {clamp01, easeInQuad, easeOutExpo, easeOutQuint, prog} from '../motion';
import {chartWorld} from '../phonePath';
import {font, stage} from '../theme';
import {Word} from '../type/Word';
import {beatAt} from './beat';
import {PHONE_Z} from './PhoneObject';

const FRONT = PHONE_Z + 30;

/**
 * 0:41–1:17 — the custom category, the joke, and the ending.
 *
 * The percentages here are anchored to the chart in world space rather than
 * parked on the opposite side of the screen: the number and the segment it
 * describes are one composition that the camera frames together.
 */
export const ActPunch: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Hookah frame={frame} />
      <Favorite frame={frame} />
      <Ending frame={frame} />
    </>
  );
};

const Hookah: React.FC<{frame: number}> = ({frame}) => {
  const chart = chartWorld(frame);
  const share = shareAt(frame, 'hookah');
  const sport = shareAt(frame, 'sport');

  const name = beatAt(frame, B.kalyan, B.kalyanOut, 28, 20);
  const small = beatAt(frame, B.sportSmall, B.sportOut, 30, 18);
  const joke = beatAt(frame, B.joke, B.jokeOut, 26, 22);

  return (
    <>
      {/* Name and value as one block, anchored beside the segment itself. */}
      {name.live ? (
        <Layer
          frame={frame}
          // Far enough left that the block clears the device: an anchored
          // number that collides with the product is worse than an unanchored
          // one.
          x={chart.x - 470}
          y={chart.y + 30}
          z={FRONT}
          parallax={1.08}
          opacity={name.opacity}
          blur={name.exit * 14}
          style={{textAlign: 'right'}}
        >
          <div style={{textAlign: 'right'}}>
            <Word
              text="КАЛЬЯН"
              size={74}
              weight={800}
              tone="white"
              uppercase
              tracking="-0.035em"
            />
          </div>
          <div style={{marginTop: -10, textAlign: 'right'}}>
            <Word
              text={`${Math.round(share)}%`}
              size={168}
              weight={900}
              tone="fire"
              glow={0.6}
              tracking="-0.055em"
              letterStyle={(i) => {
                const p = easeOutExpo(prog(frame, B.kalyan + 8 + i * 2, 26));
                return {
                  opacity: clamp01(p * 1.5),
                  transform: `translateY(${(1 - p) * 90}px)`,
                  filter: p < 0.98 ? `blur(${(1 - p) * 24}px)` : undefined,
                };
              }}
            />
          </div>
        </Layer>
      ) : null}

      {/* Very small, and that contrast is the whole joke. */}
      {small.live ? (
        <Layer
          frame={frame}
          x={chart.x - 430}
          y={chart.y + 210}
          z={FRONT}
          parallax={1.02}
          opacity={small.opacity * 0.85}
        >
          <Word
            text={`СПОРТ — ${Math.round(sport)}%`}
            size={34}
            weight={600}
            tone="muted"
            uppercase
            tracking={`${0.5 - easeOutQuint(prog(frame, B.sportSmall, 44)) * 0.34}em`}
          />
        </Layer>
      ) : null}

      {joke.live ? (
        <Layer
          frame={frame}
          x={-430}
          y={0}
          z={FRONT}
          parallax={1.1}
          opacity={joke.opacity}
          blur={joke.exit * 16}
        >
          <div>
            <Word text="может, пора" size={56} weight={500} tone="white" tracking="0.01em" />
          </div>
          <div style={{marginTop: 2}}>
            <Word text="ЗАНЯТЬСЯ" size={96} weight={700} tone="white" uppercase tracking="-0.03em" />
          </div>
          <div style={{marginTop: -18}}>
            <Word
              text="СПОРТОМ?"
              size={238}
              weight={900}
              tone="fire"
              glow={0.6}
              uppercase
              tracking="-0.055em"
              letterStyle={(i) => {
                const p = easeOutExpo(prog(frame, B.joke + 16 + i * 1.5, 26));
                return {
                  opacity: clamp01(p * 1.5),
                  transform: `translateY(${(1 - p) * 110}px) scale(${0.9 + p * 0.1})`,
                  filter: p < 0.97 ? `blur(${(1 - p) * 26}px)` : undefined,
                };
              }}
            />
          </div>
        </Layer>
      ) : null}
    </>
  );
};

const Favorite: React.FC<{frame: number}> = ({frame}) => {
  const chart = chartWorld(frame);
  const share = shareAt(frame, 'favorite');

  const num = beatAt(frame, B.num, B.numOut, 30, 22);
  // Clears before the punch lands, not during it: the brief's "brief silence"
  // only exists if the frame is genuinely empty for a beat.
  const official = beatAt(frame, B.official, B.punch - 16, 26, 12);
  const punch = beatAt(frame, B.punch, B.punchOut, 24, 20);

  return (
    <>
      {/* One object: the number and its label share a block, an alignment and
          a single entrance, so they move as one thing. */}
      {num.live ? (
        <Layer
          frame={frame}
          x={chart.x - 470}
          y={chart.y + 40}
          z={FRONT}
          parallax={1.08}
          opacity={num.opacity}
          scale={1 - num.exit * 0.08}
          blur={num.exit * 14}
        >
          <div style={{textAlign: 'right'}}>
            <Word
              text={`${Math.round(share)}%`}
              size={180}
              weight={900}
              tone="fire"
              glow={0.65}
              tracking="-0.06em"
              letterStyle={(i) => {
                const p = easeOutExpo(prog(frame, B.num + i * 3, 30));
                return {
                  opacity: clamp01(p * 1.4),
                  transform: `translateY(${(1 - p) * 120}px)`,
                  filter: p < 0.98 ? `blur(${(1 - p) * 28}px)` : undefined,
                };
              }}
            />
          </div>
          <div style={{marginTop: -12, textAlign: 'right'}}>
            <Word
              text="РАСХОДОВ"
              size={46}
              weight={600}
              tone="white"
              uppercase
              tracking={`${0.34 - easeOutQuint(prog(frame, B.num + 14, 40)) * 0.29}em`}
            />
          </div>
        </Layer>
      ) : null}

      {/* Everything else is gone by now — including the product. */}
      {official.live ? (
        <Layer
          frame={frame}
          y={-260}
          z={FRONT}
          parallax={1.04}
          opacity={official.opacity * 0.9}
        >
          <Word
            text="ОФИЦИАЛЬНО:"
            size={38}
            weight={600}
            tone="muted"
            uppercase
            tracking={`${0.72 - easeOutQuint(prog(frame, B.official, 40)) * 0.4}em`}
          />
        </Layer>
      ) : null}

      {punch.live ? <Punchline frame={frame} beat={punch} /> : null}
    </>
  );
};

/**
 * The last frame of typography in the film, and the only one allowed to be
 * perfectly centred and perfectly still.
 *
 * It then collapses to a point rather than fading — and the point is what the
 * logo grows out of.
 */
const Punchline: React.FC<{frame: number; beat: ReturnType<typeof beatAt>}> = ({frame, beat}) => {
  const collapse = easeOutQuint(prog(frame, B.toPoint, 26));

  return (
    <Layer
      frame={frame}
      z={PHONE_Z + 50}
      parallax={1.06}
      opacity={beat.opacity}
      scale={1 - collapse * 0.94}
      style={{textAlign: 'center'}}
    >
      <div style={{textAlign: 'center', whiteSpace: 'nowrap'}}>
        <Word
          text="ВЫ"
          size={148}
          weight={800}
          tone="white"
          uppercase
          tracking="0.02em"
          style={{opacity: 1 - collapse}}
        />
      </div>
      <div style={{marginTop: -10, textAlign: 'center'}}>
        <Word
          text="ПОДКАБЛУЧНИК"
          size={218}
          weight={900}
          tone="fire"
          glow={0.7}
          uppercase
          tracking="-0.05em"
          letterStyle={(i) => {
            const p = easeOutExpo(prog(frame, B.punch + 4 + i * 1.2, 24));
            return {
              opacity: clamp01(p * 1.7),
              transform: `translateY(${(1 - p) * 130}px)`,
              filter: p < 0.97 ? `blur(${(1 - p) * 30}px)` : undefined,
            };
          }}
        />
      </div>
      <div
        style={{
          marginTop: 18,
          textAlign: 'center',
          fontSize: 96,
          opacity: clamp01(easeOutQuint(prog(frame, B.punch + 24, 22))) * (1 - collapse),
        }}
      >
        😏
      </div>
    </Layer>
  );
};

const Ending: React.FC<{frame: number}> = ({frame}) => {
  const point = easeOutQuint(prog(frame, B.toPoint + 10, 20));
  const logo = easeOutExpo(prog(frame, B.logo, 32));
  const tag = easeOutQuint(prog(frame, B.monitoring, 34));
  const out = easeInQuad(prog(frame, B.fadeOut, 30));

  if (frame < B.toPoint - 4) return null;

  return (
    <>
      {/* The collapsed point, held for a beat before it becomes the mark. */}
      {logo < 0.02 ? (
        <Layer frame={frame} z={PHONE_Z + 50} parallax={1.06} opacity={point}>
          <div style={{width: 14, height: 14, borderRadius: 8, background: '#E8213F'}} />
        </Layer>
      ) : null}

      {logo > 0.001 ? (
        <Layer
          frame={frame}
          z={PHONE_Z + 50}
          parallax={1.06}
          opacity={clamp01(logo * 1.4) * (1 - out)}
          scale={0.2 + logo * 0.8}
        >
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Logo size={84} />
            <div
              style={{
                marginTop: 34,
                fontFamily: font.family,
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: `${0.7 - tag * 0.28}em`,
                textTransform: 'uppercase',
                color: stage.textMuted,
                opacity: tag,
              }}
            >
              Мониторинг
            </div>
          </div>
        </Layer>
      ) : null}
    </>
  );
};
