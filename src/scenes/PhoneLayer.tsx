import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {DonutChart} from '../components/DonutChart';
import {ExpenseScreen, ScreenCenterLabel} from '../components/ExpenseScreen';
import {Phone} from '../components/Phone';
import {MONTHLY_TOTAL, distributionAt, focusAt} from '../data/categories';
import {SPRING, drift, easeOutBack, easeOutCubic, kick, prog} from '../motion';
import {brand} from '../theme';
import {PHONE_LAYER, scenes} from '../timeline';

const CUTS = [
  scenes.entertainment.from,
  scenes.groceries.from,
  scenes.hookah.from,
  scenes.favorite.from,
];

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

  // ── Entrance ──────────────────────────────────────────────────────────
  // The device flies in from below the frame, oversized and out of focus,
  // then scales down into place and lands with a single soft bounce.
  const enter = spring({frame, fps, config: SPRING.land, durationInFrames: 46});
  // Focus resolves faster than the move: a handset still blurred once it has
  // stopped reads as a bad render, not as motion.
  const focusIn = easeOutCubic(prog(frame, 0, 30));

  const enterY = interpolate(enter, [0, 1], [560, 0]);
  const enterScale = interpolate(enter, [0, 1], [1.5, 1]);
  const enterRotX = interpolate(enter, [0, 1], [-16, 0]);
  const enterRotY = interpolate(enter, [0, 1], [12, 0]);
  const enterBlur = (1 - focusIn) * 18;

  // ── Staging ───────────────────────────────────────────────────────────
  // Centre stage during the reveal, then slide right to make room for text.
  // easeOutBack lets it drift a few pixels past its mark and pull back.
  const toSide = easeOutBack(prog(abs, scenes.entertainment.from - 34, 56), 0.9);

  const exit = interpolate(abs, [scenes.outro.from - 16, scenes.outro.from + 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  // ── Life ──────────────────────────────────────────────────────────────
  // Never fully at rest: a slow float plus a reaction to every cut.
  const settled = enter;
  const floatY = drift(frame, 2.3) * 7 * settled;
  const floatRotY = drift(frame, 5.1) * 1.1 * settled;
  const floatRotX = drift(frame, 7.7) * 0.6 * settled;

  let cutRotY = 0;
  let cutX = 0;
  for (const cut of CUTS) {
    const k = kick(abs, cut, 38);
    cutRotY += k * 2.6;
    cutX += k * 16;
  }

  const values = distributionAt(abs);
  const focus = focusAt(abs);
  // The emphasis pops out past its resting offset and settles back.
  const focusStrength = focus ? easeOutBack(prog(abs, focusStart(abs), 30), 1.6) : 0;

  const chartReveal = easeOutCubic(prog(frame, 14, 64));

  const x = toSide * 336 + cutX;
  // Slightly smaller and lower while centred, so the reveal caption has air
  // above the handset; it grows a touch once it moves to its side position.
  const scale = enterScale * (0.95 + toSide * 0.03) * (1 - exit * 0.1);
  const y = enterY + floatY + (1 - toSide) * 30 + exit * 90;
  const rotX = enterRotX + floatRotX;
  const rotY = enterRotY + floatRotY + cutRotY;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 1600}}>
      <div
        style={{
          transform: `translate(${x}px, ${y}px) scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          opacity: Math.min(1, enter * 2.2) * (1 - exit),
          filter: enterBlur > 0.15 ? `blur(${enterBlur}px)` : undefined,
          transformStyle: 'preserve-3d',
          willChange: 'transform, filter',
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
            transform: `translateX(-50%) scaleX(${0.8 + settled * 0.2})`,
            background:
              'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(6px)',
            opacity: settled,
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

        <Phone glare={0.55} glarePosition={0.18 + ((frame / 900) % 1)}>
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
