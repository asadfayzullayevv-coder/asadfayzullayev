import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Logo} from '../components/Logo';
import {SPRING, clamp01, drift, easeOutCubic, prog} from '../motion';
import {font, stage} from '../theme';
import {MaskReveal, TrackingIn, useExit} from '../type/kinetic';

const T = {
  know: 34,
  by: 92,
  linesOut: 148,
  logo: 164,
};

/**
 * 1:08–1:16 — the frame resolves.
 *
 * After ninety seconds of motion the ending earns the right to be still, so
 * the only movement left is the camera pulling back and the mark landing.
 */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const linesOut = useExit(T.linesOut, 20);
  const logo = spring({frame: frame - T.logo, fps, config: SPRING.land, durationInFrames: 30});
  const tag = easeOutCubic(prog(frame, T.logo + 18, 26));
  const breathe = drift(frame, 2.8) * 3;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 20}}>
      {frame < T.linesOut + 22 ? (
        <div style={{position: 'absolute', textAlign: 'center', ...linesOut.style}}>
          <MaskReveal text="ПОЗНАЙ СЕБЯ." size={132} start={T.know} duration={28} weight={900} />
          <div style={{marginTop: 18}}>
            <TrackingIn
              text="ПО СВОИМ РАСХОДАМ."
              size={54}
              start={T.by}
              duration={38}
              weight={600}
              fromTracking={0.5}
              toTracking={0.08}
            />
          </div>
        </div>
      ) : null}

      {frame > T.logo - 8 ? (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `translateY(${(1 - logo) * 30 + breathe}px) scale(${0.94 + logo * 0.06})`,
            opacity: clamp01(logo * 1.5),
          }}
        >
          <Logo size={86} />
          <div
            style={{
              marginTop: 34,
              fontFamily: font.family,
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color: stage.textMuted,
              opacity: tag,
              transform: `translateY(${(1 - tag) * 14}px)`,
            }}
          >
            Мониторинг
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
