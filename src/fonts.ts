import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/**
 * Inter is self-hosted in public/fonts (variable woff2, cyrillic + latin).
 *
 * Bundling the font instead of pulling it from Google at render time keeps
 * renders deterministic and lets the film build on machines with no network —
 * a missing webfont mid-render is the classic cause of a re-rendered batch.
 */
export const loadFonts = () =>
  Promise.all([
    loadFont({
      family: 'Inter',
      url: staticFile('fonts/inter-latin.woff2'),
      weight: '100 900',
      unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF',
    }),
    loadFont({
      family: 'Inter',
      url: staticFile('fonts/inter-cyrillic.woff2'),
      weight: '100 900',
      unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    }),
  ]);
