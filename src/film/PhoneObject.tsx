import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CategorySheet} from '../components/CategorySheet';
import {DonutChart} from '../components/DonutChart';
import {ExpenseScreen, ScreenCenterLabel} from '../components/ExpenseScreen';
import {Layer} from '../components/Layer';
import {Phone} from '../components/Phone';
import {B} from '../beats';
import {MONTHLY_TOTAL, categoryById, distributionAt, focusAt} from '../data/categories';
import {clamp01, drift, easeOutBack, easeOutCubic, prog, springNumber} from '../motion';
import {RimLight} from '../components/RimLight';
import {phoneAt} from '../phonePath';
import {brand} from '../theme';

/** Depth the handset occupies. Type either sits nearer (>100) or behind it. */
export const PHONE_Z = 100;

/**
 * The product, as one object in the world for the length of the film.
 *
 * It has no knowledge of chapters. Where it is at any frame comes from
 * phonePath.ts, and how much of it you see comes from where the camera is —
 * which is why it can be a speck, a hero, or a macro texture without ever
 * being re-mounted or re-placed.
 */
export const PhoneObject: React.FC = () => {
  const frame = useCurrentFrame();
  const p = phoneAt(frame);
  if (p.opacity <= 0.002) return null;

  const values = distributionAt(frame);
  const focus = focusAt(frame);
  const focusStrength = focus ? easeOutBack(prog(frame, focusStart(frame), 30), 1.5) : 0;
  const chartReveal = easeOutCubic(prog(frame, B.through, 34));
  // The total springs up once, on the reveal, and then holds.
  const total = springNumber(frame, B.through, 0, MONTHLY_TOTAL, 46);

  // Alive, never idle — but small enough that it reads as breath, not motion.
  const settled = clamp01(prog(frame, B.phoneIn, 40));

  // Inertia. Sampling the path a few frames back gives real velocity, and the
  // body then banks into its own movement and trails it slightly — the thing
  // that separates an object with mass from a sprite being repositioned.
  const prev = phoneAt(frame - 5);
  const vx = (p.x - prev.x) / 5;
  const vs = (p.scale - prev.scale) / 5;
  const bank = clampTo(-vx * 0.42, 11);
  const lag = clampTo(-vx * 1.5, 30);
  const pitch = clampTo(vs * 70, 5);

  const rotY = p.rotY + bank + drift(frame, 5.1) * 0.9 * settled;
  const rotX = p.rotX + pitch + drift(frame, 7.7) * 0.5 * settled;

  return (
    <Layer
      frame={frame}
      x={p.x + lag}
      y={p.y}
      z={PHONE_Z}
      scale={p.scale}
      opacity={p.opacity}
      blur={p.blur}
      style={{perspective: 2200}}
    >
      <div
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        <RimLight rotY={rotY} />
        <div
          style={{
            position: 'absolute',
            inset: -90,
            background: `radial-gradient(50% 50% at 50% 50%, ${brand.redGlow} 0%, rgba(200,16,46,0) 70%)`,
            opacity: 0.34,
            filter: 'blur(38px)',
          }}
        />
        <Phone glare={0.5} glarePosition={0.18 + ((frame / 1100) % 1)}>
          <ExpenseScreen
            values={values}
            frame={frame}
            focus={focus}
            focusStrength={focusStrength}
            chart={
              <DonutChart
                values={values}
                size={228}
                thickness={34}
                reveal={chartReveal}
                focus={focus}
                focusStrength={focusStrength}
                sway={drift(frame, 3.9) * 1.0}
              >
                <ScreenCenterLabel caption="Всего за месяц" amount={total} />
              </DonutChart>
            }
            overlay={
              <>
                <CategorySheet
                  frame={frame}
                  name="Кальян"
                  color={categoryById('hookah').color}
                  openAt={B.sheetOpen}
                  typeAt={B.typeName}
                  confirmAt={B.created}
                  closeAt={B.created + 6}
                />
                <CategorySheet
                  frame={frame}
                  name="Любимая"
                  color={categoryById('favorite').color}
                  openAt={B.favSheet}
                  typeAt={B.favType}
                  confirmAt={B.favCreated}
                  closeAt={B.favCreated + 6}
                />
              </>
            }
          />
        </Phone>
      </div>
    </Layer>
  );
};

/** Symmetric clamp, for velocity-derived values that must not run away. */
const clampTo = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));

const focusStart = (frame: number) => {
  if (frame >= B.favGrow) return B.favGrow;
  if (frame >= B.hookahGrow) return B.hookahGrow;
  if (frame >= B.greenPush - 40) return B.greenPush - 40;
  return B.entGrow;
};
