import React from 'react';
import {CategoryId} from '../data/categories';

/**
 * Minimal line icons for the category rows.
 *
 * Emoji were the fast option but render as toy-coloured bitmaps at 1080p and
 * break the premium light UI; these inherit the category colour instead.
 */
const PATHS: Record<CategoryId, React.ReactNode> = {
  entertainment: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M10 9.5v5l4.5-2.5L10 9.5Z" />
    </>
  ),
  groceries: (
    <>
      <path d="M3 4h2.2l2.1 10.2A2 2 0 0 0 9.3 15.8h7.9a2 2 0 0 0 2-1.6L20.5 7H6" />
      <circle cx="10" cy="19.2" r="1.3" />
      <circle cx="17" cy="19.2" r="1.3" />
    </>
  ),
  transport: (
    <>
      <path d="M4 16v-4.2l1.9-4.3A2 2 0 0 1 7.7 6.3h8.6a2 2 0 0 1 1.8 1.2L20 11.8V16" />
      <path d="M4 12.2h16" />
      <circle cx="7.6" cy="16.4" r="1.5" />
      <circle cx="16.4" cy="16.4" r="1.5" />
    </>
  ),
  cafe: (
    <>
      <path d="M5 8h11v5.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 13.5V8Z" />
      <path d="M16 9.4h1.8a2.3 2.3 0 0 1 0 4.6H16" />
      <path d="M8 3.6v2M11.5 3.2v2.4" />
    </>
  ),
  hookah: (
    <>
      <path d="M12 20.5v-6" />
      <path d="M8.6 14.5h6.8l-1 5.6H9.6l-1-5.6Z" />
      <path d="M12 11.6c2.6-1 1-2.7 0-3.4-1.1-.8-1.4-2 .3-3.2" />
      <path d="M15.6 11.2c1.8-.8.9-2 .1-2.5" />
    </>
  ),
  sport: (
    <>
      <path d="M3.5 9.6v4.8M20.5 9.6v4.8" />
      <path d="M6.6 7.4v9.2M17.4 7.4v9.2" />
      <path d="M6.6 12h10.8" />
    </>
  ),
  favorite: (
    <path d="M12 20s-7.4-4.4-7.4-9.3A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.4 2.5C19.4 15.6 12 20 12 20Z" />
  ),
  other: (
    <>
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
    </>
  ),
};

const FILLED: CategoryId[] = ['favorite', 'other'];

export const CategoryIcon: React.FC<{id: CategoryId; color: string; size?: number}> = ({
  id,
  color,
  size = 16,
}) => {
  const filled = FILLED.includes(id);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={filled ? 'none' : color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[id]}
    </svg>
  );
};
