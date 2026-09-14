import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CategorySheet} from '../components/CategorySheet';
import {DonutChart} from '../components/DonutChart';
import {ExpenseScreen, ScreenCenterLabel} from '../components/ExpenseScreen';
import {Phone} from '../components/Phone';
import {
  CREATED_AT,
  MONTHLY_TOTAL,
  categoryById,
  distributionAt,
  focusAt,
} from '../data/categories';
import {clamp01, drift, easeOutBack, easeOutCubic, kick, prog} from '../motion';
import {stageAt} from '../staging';
import {brand} from '../theme';
import {PHONE_LAYER, scenes} from '../timeline';

const CUTS = [
  scenes.entertainment.from,
  scenes.groceries.from,
  scenes.hookah.from,
  scenes.favorite.from,
];

/**
 * The handset, alive from 0:06.8 to the last frame.
 *
 * It is mounted exactly once. Every chapter change is a camera move over the
 * same physical object — which is why a segment can visibly grow out of the
 * value the previous chapter left it at, and why the film never cuts to a
 * "new" phone.
 */
export const PhoneStage: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = PHONE_LAYER.from + frame;

  const stage = stageAt(abs);
  const values = distributionAt(abs);
  const focus = focusAt(abs);
  const focusStrength = focus ? easeOutBack(prog(abs, focusStart(abs), 30), 1.6) : 0;

  // Never fully at rest, and it reacts to every chapter change.
  const settled = clamp01(prog(abs, PHONE_LAYER.from + 20, 40));
  let cutRotY = 0;
  for (const cut of CUTS) cutRotY += kick(abs, cut, 38) * 2.4;

  const chartReveal = easeOutCubic(prog(abs, PHONE_LAYER.from + 4, 40));

  const x = stage.x + drift(abs, 1.7) * 6 * settled;
  const y = stage.y + drift(abs, 2.3) * 7 * settled;
  const rotY = stage.rotY + drift(abs, 5.1) * 1.2 * settled + cutRotY;
  const rotX = drift(abs, 7.7) * 0.7 * settled;

  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'center', perspective: 1600, zIndex: 10}}
    >
      <div
        style={{
          transform: `translate(${x}px, ${y}px) scale(${stage.scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          opacity: stage.opacity,
          filter: stage.blur > 0.15 ? `blur(${stage.blur}px)` : undefined,
          transformStyle: 'preserve-3d',
          willChange: 'transform, filter',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -54,
            width: 520,
            height: 80,
            transform: 'translateX(-50%)',
            background:
              'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(6px)',
            opacity: settled,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: -80,
            background: `radial-gradient(50% 50% at 50% 50%, ${brand.redGlow} 0%, rgba(200,16,46,0) 70%)`,
            opacity: 0.55,
            filter: 'blur(30px)',
          }}
        />

        <Phone glare={0.55} glarePosition={0.18 + ((abs / 900) % 1)}>
          <ExpenseScreen
            values={values}
            frame={abs}
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
                sway={drift(abs, 3.9) * 1.2}
              >
                <ScreenCenterLabel caption="Всего за месяц" amount={MONTHLY_TOTAL * chartReveal} />
              </DonutChart>
            }
            overlay={
              <>
                <CategorySheet
                  frame={abs}
                  name="Кальян"
                  color={categoryById('hookah').color}
                  openAt={scenes.hookah.from + 12}
                  typeAt={scenes.hookah.from + 34}
                  confirmAt={CREATED_AT.hookah}
                  closeAt={CREATED_AT.hookah + 6}
                />
                <CategorySheet
                  frame={abs}
                  name="Любимая"
                  color={categoryById('favorite').color}
                  openAt={scenes.favorite.from + 8}
                  typeAt={scenes.favorite.from + 30}
                  confirmAt={CREATED_AT.favorite}
                  closeAt={CREATED_AT.favorite + 6}
                />
              </>
            }
          />
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

/** Frame at which the current chapter's emphasis starts ramping in. */
const focusStart = (abs: number) => {
  if (abs >= CREATED_AT.favorite) return CREATED_AT.favorite + 10;
  if (abs >= CREATED_AT.hookah) return CREATED_AT.hookah + 10;
  if (abs >= scenes.groceries.from) return scenes.groceries.from + 40;
  return scenes.entertainment.from + 15;
};
