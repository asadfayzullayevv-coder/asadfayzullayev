import React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {
  CATEGORIES,
  CategoryId,
  CURRENCY,
  Distribution,
  MONTHLY_TOTAL,
  formatMoney,
  rowRanksAt,
} from '../data/categories';
import {CategoryIcon} from './CategoryIcon';
import {SPRING, clamp01} from '../motion';
import {brand, font, ui} from '../theme';
import {withAlpha} from '../utils/color';

export const SCREEN_W = 390;
export const SCREEN_H = 844;

const ROW_H = 52;

export type ExpenseScreenProps = {
  values: Distribution;
  /** Absolute film frame, used for per-row appear animations. */
  frame: number;
  focus?: CategoryId | null;
  focusStrength?: number;
  chart: React.ReactNode;
  /** Sheets and modals drawn over the screen, inside the device. */
  overlay?: React.ReactNode;
};

export const ExpenseScreen: React.FC<ExpenseScreenProps> = ({
  values,
  frame,
  focus = null,
  focusStrength = 1,
  chart,
  overlay,
}) => {
  const {fps} = useVideoConfig();
  const visible = CATEGORIES.filter(
    (c) => c.appearsAt === undefined || frame >= c.appearsAt,
  ).map((c) => c.id);
  const ranks = rowRanksAt(frame, visible);
  const max = Math.max(...visible.map((v) => values[v]), 1);
  // Normalised against the running total, exactly as the donut does. During
  // an overshoot the raw values no longer sum to 100, and a list that
  // disagreed with the chart beside it would give the whole trick away.
  const total = visible.reduce((sum, id) => sum + values[id], 0) || 1;

  return (
    <div
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        backgroundColor: ui.bg,
        fontFamily: font.family,
        color: ui.text,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusBar />

      <div style={{padding: '4px 20px 0', display: 'flex', alignItems: 'center', gap: 10}}>
        <div style={{fontSize: 27, fontWeight: 800, letterSpacing: font.tighter}}>Расходы</div>
        <div
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            fontWeight: 600,
            color: brand.red,
            background: withAlpha(brand.red, 0.09),
            padding: '6px 12px',
            borderRadius: 999,
          }}
        >
          Сентябрь
        </div>
      </div>

      <div
        style={{
          margin: '14px 16px 0',
          background: ui.surface,
          borderRadius: 26,
          boxShadow: ui.shadow,
          padding: '14px 0 10px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {chart}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          padding: '16px 20px 8px',
        }}
      >
        <div style={{fontSize: 14, fontWeight: 700}}>Категории</div>
        <div style={{marginLeft: 'auto', fontSize: 12, color: ui.textTertiary}}>Все</div>
      </div>

      <div style={{position: 'relative', flex: 1, margin: '0 16px'}}>
        {CATEGORIES.map((c) => {
          const appeared = c.appearsAt === undefined || frame >= c.appearsAt;
          if (!appeared) return null;

          // A newly created category springs in rather than fading up: it is
          // the moment the viewer is meant to notice.
          const enter = c.appearsAt
            ? spring({
                frame: frame - c.appearsAt,
                fps,
                config: SPRING.land,
                durationInFrames: 26,
              })
            : 1;

          const y = (ranks[c.id] ?? 0) * ROW_H;
          const isFocus = focus === c.id;
          const pct = values[c.id];

          return (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: ROW_H,
                transform: `translateY(${y + (1 - enter) * 22}px) scale(${0.94 + enter * 0.06})`,
                opacity: clamp01(enter * 1.4),
                // Rows physically cross during a reorder. An opaque ground
                // plus a raised focused row turns that crossing into one card
                // sliding over another instead of two labels colliding.
                background: ui.bg,
                borderRadius: 16,
                zIndex: isFocus ? 50 : 10,
              }}
            >
              <CategoryRow
                id={c.id}
                label={c.label}
                color={c.color}
                custom={c.custom}
                pct={(pct / total) * 100}
                fill={pct / max}
                focus={isFocus}
                focusStrength={focusStrength}
                frame={frame}
              />
            </div>
          );
        })}
      </div>

      {overlay ? (
        <div style={{position: 'absolute', inset: 0, zIndex: 100}}>{overlay}</div>
      ) : null}
    </div>
  );
};

const CategoryRow: React.FC<{
  id: CategoryId;
  label: string;
  color: string;
  custom?: boolean;
  pct: number;
  fill: number;
  focus: boolean;
  focusStrength: number;
  frame: number;
}> = ({id, label, color, custom, pct, fill, focus, focusStrength, frame}) => (
  <div
    style={{
      height: ROW_H - 6,
      borderRadius: 16,
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: focus ? withAlpha(color, 0.08 * focusStrength) : 'transparent',
      boxShadow: focus ? `inset 0 0 0 ${1.5 * focusStrength}px ${withAlpha(color, 0.28)}` : 'none',
      transform: `scale(${1 + (focus ? 0.015 * focusStrength : 0)})`,
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        background: withAlpha(color, 0.14),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CategoryIcon id={id} color={color} size={17} />
    </div>

    <div style={{flex: 1, minWidth: 0}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
        <div style={{fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap'}}>{label}</div>
        {custom ? (
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: ui.textTertiary,
              border: `1px solid ${ui.hairline}`,
              borderRadius: 6,
              padding: '1px 5px',
            }}
          >
            своя
          </div>
        ) : null}
      </div>
      <div
        style={{
          marginTop: 5,
          height: 4,
          borderRadius: 4,
          background: 'rgba(11,15,25,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: `${Math.max(0, Math.min(1, fill)) * 100}%`,
            height: '100%',
            borderRadius: 4,
            background: color,
            overflow: 'hidden',
          }}
        >
          {/* A light sweep travels the focused bar so the highlighted row is
              never a static block of colour. */}
          {focus ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '38%',
                left: `${((frame * 1.1) % 170) - 40}%`,
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
                opacity: 0.7 * Math.min(1, focusStrength),
              }}
            />
          ) : null}
        </div>
      </div>
    </div>

    <div style={{textAlign: 'right'}}>
      <div style={{fontSize: 14, fontWeight: 800, letterSpacing: font.tight}}>
        {Math.round(pct)}%
      </div>
      <div style={{fontSize: 10.5, color: ui.textTertiary, marginTop: 1}}>
        {formatMoney((MONTHLY_TOTAL * pct) / 100)}
      </div>
    </div>
  </div>
);

const StatusBar: React.FC = () => (
  <div
    style={{
      height: 44,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: font.tight,
    }}
  >
    <div>9:41</div>
    <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6}}>
      <Signal />
      <Wifi />
      <Battery />
    </div>
  </div>
);

const Signal: React.FC = () => (
  <svg width="17" height="11" viewBox="0 0 17 11">
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i}
        x={i * 4.4}
        y={11 - (i + 1) * 2.6}
        width="3"
        height={(i + 1) * 2.6}
        rx="1"
        fill={ui.text}
      />
    ))}
  </svg>
);

const Wifi: React.FC = () => (
  <svg width="16" height="11" viewBox="0 0 16 11">
    <path
      d="M8 10.2 5.6 7.6a3.5 3.5 0 0 1 4.8 0L8 10.2Zm-4.5-4.8a7.5 7.5 0 0 1 9 0l-1.4 1.5a5.5 5.5 0 0 0-6.2 0L3.5 5.4ZM.9 2.7a11.2 11.2 0 0 1 14.2 0l-1.4 1.5a9.2 9.2 0 0 0-11.4 0L.9 2.7Z"
      fill={ui.text}
    />
  </svg>
);

const Battery: React.FC = () => (
  <svg width="26" height="12" viewBox="0 0 26 12">
    <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke="rgba(11,15,25,0.35)" />
    <rect x="2" y="2" width="15" height="8" rx="2" fill={ui.text} />
    <path d="M23 4v4a2.2 2.2 0 0 0 0-4Z" fill="rgba(11,15,25,0.35)" />
  </svg>
);

export const ScreenCenterLabel: React.FC<{pct?: number; caption: string; amount: number}> = ({
  caption,
  amount,
}) => (
  <div style={{fontFamily: font.family}}>
    <div style={{fontSize: 10.5, color: ui.textTertiary, letterSpacing: '0.06em', textTransform: 'uppercase'}}>
      {caption}
    </div>
    <div style={{fontSize: 23, fontWeight: 800, letterSpacing: font.tighter, marginTop: 3}}>
      {formatMoney(amount)}
    </div>
    <div style={{fontSize: 11, color: ui.textSecondary, marginTop: 1}}>{CURRENCY}</div>
  </div>
);
