import React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {SPRING, clamp01, easeInQuad, easeOutCubic, prog} from '../motion';
import {TypeCursor} from '../type/kinetic';
import {brand, font, ui} from '../theme';
import {withAlpha} from '../utils/color';
import {SCREEN_H, SCREEN_W} from './ExpenseScreen';

export type CategorySheetProps = {
  name: string;
  color: string;
  openAt: number;
  typeAt: number;
  confirmAt: number;
  closeAt: number;
  /** Absolute film frame — the handset's Sequence has its own clock. */
  frame: number;
};

/**
 * The in-app sheet for creating a custom category.
 *
 * The film needs the viewer to believe a person made this category, and no
 * amount of typography sells that as well as watching the field fill in. No
 * hand, no cursor arrow — just the caret, the way a screen recording looks.
 */
export const CategorySheet: React.FC<CategorySheetProps> = ({
  name,
  color,
  openAt,
  typeAt,
  confirmAt,
  closeAt,
  frame,
}) => {
  const {fps} = useVideoConfig();

  const open = spring({frame: frame - openAt, fps, config: SPRING.land, durationInFrames: 26});
  const close = easeInQuad(prog(frame, closeAt, 20));
  const shown = open * (1 - close);
  if (shown <= 0.001) return null;

  // A real press: down fast, back slower, with a ring leaving the contact
  // point. Scaling a button up on activation is the classic tell of a mock;
  // hardware goes in.
  const down = easeOutCubic(prog(frame, confirmAt, 4));
  const up = easeOutCubic(prog(frame, confirmAt + 4, 16));
  const press = down * (1 - up);
  const ripple = clamp01(prog(frame, confirmAt, 26));
  const filled = clamp01(prog(frame, typeAt, name.length * 4));

  return (
    <div style={{position: 'absolute', inset: 0, width: SCREEN_W, height: SCREEN_H}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(11,15,25,0.34)',
          opacity: shown,
          backdropFilter: 'blur(2px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          transform: `translateY(${(1 - shown) * 340}px)`,
          background: ui.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '12px 20px 26px',
          boxShadow: '0 -18px 50px rgba(11,15,25,0.18)',
          fontFamily: font.family,
        }}
      >
        <div
          style={{
            width: 38,
            height: 4,
            borderRadius: 3,
            background: 'rgba(11,15,25,0.14)',
            margin: '0 auto 16px',
          }}
        />
        <div style={{fontSize: 17, fontWeight: 800, letterSpacing: font.tighter}}>
          Новая категория
        </div>
        <div style={{fontSize: 11.5, color: ui.textTertiary, marginTop: 3}}>
          Название и цвет — остальное посчитаем сами
        </div>

        <div
          style={{
            marginTop: 14,
            height: 46,
            borderRadius: 14,
            background: ui.surfaceAlt,
            border: `1.5px solid ${withAlpha(color, 0.35 + filled * 0.35)}`,
          // The field breathes while it is being typed into.
          boxShadow: `0 0 0 ${3 + Math.sin(frame / 5) * 1.2}px ${withAlpha(color, 0.09 * (1 - filled * 0.6))}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: withAlpha(color, 0.18 + filled * 0.6),
            }}
          />
          <TypeCursor text={name} size={15} start={typeAt} caretColor={color} now={frame} />
        </div>

        <div style={{display: 'flex', gap: 8, marginTop: 14}}>
          {['#14B8A6', '#C8102E', '#3B82F6', '#FF7A45', '#A855F7'].map((c) => (
            <div
              key={c}
              style={{
                width: 26,
                height: 26,
                borderRadius: 9,
                background: c,
                outline: c === color ? `2px solid ${ui.text}` : 'none',
                outlineOffset: 2,
                opacity: c === color ? 1 : 0.35,
              }}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            height: 46,
            borderRadius: 14,
            background: brand.red,
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            transform: `scale(${1 - press * 0.035})`,
            // The shadow collapses as the button goes down, the way a real
            // surface loses its gap when pressed.
            boxShadow: `0 ${10 - press * 7}px ${24 - press * 14}px ${withAlpha(brand.red, 0.34 - press * 0.16)}`,
            filter: `brightness(${1 - press * 0.08})`,
          }}
        >
          {ripple > 0 && ripple < 1 ? (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 40,
                height: 40,
                marginLeft: -20,
                marginTop: -20,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.36)',
                transform: `scale(${0.2 + ripple * 9})`,
                opacity: 1 - ripple,
              }}
            />
          ) : null}
          <span style={{position: 'relative'}}>Создать категорию</span>
        </div>
      </div>
    </div>
  );
};
