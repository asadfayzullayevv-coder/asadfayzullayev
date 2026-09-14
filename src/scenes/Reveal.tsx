import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TrackingIn, useExit} from '../type/kinetic';

/**
 * 0:09–0:13.5 — the product lands.
 *
 * Almost no typography by design: the film has just spent nine seconds
 * building to this object, and putting a headline over it here would throw
 * the reveal away.
 */
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const out = useExit(96, 20);

  return (
    <AbsoluteFill style={{alignItems: 'center', zIndex: 20, paddingTop: 84}}>
      {frame < 120 ? (
        <div style={out.style}>
          <TrackingIn
            text="МОНИТОРИНГ РАСХОДОВ · ANORBANK"
            size={26}
            start={16}
            duration={40}
            weight={600}
            tone="muted"
            fromTracking={0.7}
            toTracking={0.32}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
