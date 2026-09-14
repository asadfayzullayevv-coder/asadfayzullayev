import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {DonutChart} from '../components/DonutChart';
import {ExpenseScreen, ScreenCenterLabel} from '../components/ExpenseScreen';
import {Phone} from '../components/Phone';
import {
  MONTHLY_TOTAL,
  distributionAt,
  focusAt,
} from '../data/categories';
import {brand, ease} from '../theme';
import {PHONE_LAYER, scenes} from '../timeline';

/**
 * One continuous phone layer for 0:10–1:06.
 *
 * Keeping the handset mounted across every scene is what makes the film feel
 * like a product demo rather than a slideshow: the chart never remounts, so
 * every segment visibly morphs from the previous scene's value.
 */
export const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = PHONE_LAYER.from + frame;

  // Entrance on the drop.
  const enter = spring({frame, fps, config: {damping: 200, mass: 1.4, stiffness: 70}});

  // Centre stage during the reveal, then slide right to make room for text.
  const toSide = interpolate(
    abs,
    [scenes.entertainment.from - 34, scenes.entertainment.from + 22],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut},
  );

  // Exit into the outro.
  const exit = interpolate(abs, [scenes.outro.from - 16, scenes.outro.from + 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.in,
  });

  const values = distributionAt(abs);
  const focus = focusAt(abs);

  const focusStrength = focus
    ? interpolate(abs, [focusStart(abs), focusStart(abs) + 26], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: ease.out,
      })
    : 0;

  const chartReveal = interpolate(frame, [14, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.inOut,
  });

  const x = toSide * 336;
  // Slightly smaller and lower while centred, so the reveal caption has air
  // above the handset; it grows a touch once it moves to its side position.
  const scale = (0.9 + enter * 0.1) * (0.95 + toSide * 0.03) * (1 - exit * 0.1);
  const y = (1 - enter) * 70 + (1 - toSide) * 30 + exit * 90;
  const tilt = (1 - enter) * 8;

  const totalShown = MONTHLY_TOTAL * chartReveal;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 2400}}>
      <div
        style={{
          transform: `translate(${x}px, ${y}px) scale(${scale}) rotateX(${tilt}deg) rotateY(${-tilt * 0.6}deg)`,
          opacity: enter * (1 - exit),
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Contact shadow under the device */}
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
          }}
        />
        {/* Brand glow behind the glass */}
        <div
          style={{
            position: 'absolute',
            inset: -80,
            background: `radial-gradient(50% 50% at 50% 50%, ${brand.redGlow} 0%, rgba(200,16,46,0) 70%)`,
            opacity: 0.55,
            filter: 'blur(30px)',
          }}
        />

        <Phone glare={0.55} glarePosition={0.18 + (frame / 900) % 1}>
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
              >
                <ScreenCenterLabel caption="Всего за месяц" amount={totalShown} />
              </DonutChart>
            }
          />
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

/** Frame at which the current scene's emphasis starts ramping in. */
const focusStart = (abs: number) => {
  const order = [scenes.entertainment, scenes.groceries, scenes.hookah, scenes.favorite];
  let start = scenes.entertainment.from;
  for (const s of order) {
    if (abs >= s.from) start = s.from + 30;
  }
  return start;
};
