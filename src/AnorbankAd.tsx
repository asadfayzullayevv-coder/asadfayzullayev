import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Background} from './components/Background';
import {Particles} from './components/Particles';
import {ActChapters} from './film/ActChapters';
import {ActOpening} from './film/ActOpening';
import {ActPunch} from './film/ActPunch';
import {PhoneObject} from './film/PhoneObject';
import {MUSIC} from './timeline';

/**
 * Anorbank — «Мониторинг расходов». 77s, 1920x1080 @ 30fps.
 *
 * One continuous take. There are no <Sequence> boundaries in this film on
 * purpose: every element reads the same clock and lives at a world coordinate,
 * and the camera path in world.ts is what carries the viewer from one chapter
 * to the next. A chapter cannot "start" or "reset", because there is nothing
 * to start — only a camera that keeps moving and elements whose windows
 * overlap across the joins.
 *
 * Depth, not order, decides what covers what: the handset holds z=100, and
 * typography picks a side of it. Grain and vignette stay outside the world in
 * Background — they belong to the lens.
 */
export const AnorbankAd: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#05060A'}}>
    <Background />

    {MUSIC.enabled ? <Audio src={staticFile(MUSIC.src)} /> : null}

    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Particles />
      <PhoneObject />
      <ActOpening />
      <ActChapters />
      <ActPunch />
    </AbsoluteFill>
  </AbsoluteFill>
);
