---
name: tassvision-brand-guidelines
description: Applies Tassvision's official brand colors and typography to any sort of artifact that may benefit from having Tassvision's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.
---

# Tassvision Brand Styling

## Overview

To access Tassvision's official brand identity and style resources, use this skill.

**Keywords**: branding, corporate identity, visual identity, post-processing, styling, brand colors, typography, Tassvision brand, visual formatting, visual design

## Brand Guidelines

### Colors

**Primary Brand Color:**

- Primary: `#8217fd` — Main brand color, CTAs, highlights (HSL: 268, 98%, 50%)
- Secondary: `#3894F7` — Accent, badges, secondary CTAs (HSL: 339, 77%, 53%)

**Background Colors:**

- White: `#ffffff` — Default background
- White Smoke: `#fcfcfc` — Subtle background
- Widget Grey: `#f5f6fa` — Card/section backgrounds
- Fade Grey: `#ededed` — Dividers and borders
- Dark Background: `#232326` — Dark mode background (HSL: 240, 4%, 14%)
- Night: `#0a0a14` — Deepest dark background (HSL: 240, 33%, 6%)

**Text Colors:**

- Dark Text: `#283252` — Primary headings and body text (HSL: 226, 34%, 24%)
- Medium Text: `#757a91` — Secondary/paragraph text (HSL: 229, 11%, 51%)
- Light Text: `#a2a5b9` — Muted/placeholder text (HSL: 232, 14%, 68%)

**Border Colors:**

- Border: `#e5e5e5` — Default borders
- Border Hover: `#d4cfcf` — Hover state borders
- Dark Border: `#393945` — Dark mode borders
- Placeholder: `#cecece` — Input placeholders

**Status / Accent Colors:**

- Success: `#38c79c` — Success states (HSL: 162, 56%, 50%)
- Info: `#039be5` — Informational (HSL: 200, 97%, 45%)
- Warning: `#faae42` — Warnings (HSL: 35, 95%, 62%)
- Danger: `#e62965` — Error/danger states (HSL: 341, 79%, 53%)

**Extended Palette:**

- Purple: `#8269b2` — Decorative accent (HSL: 261, 32%, 55%)
- Blue: `#37c3ff` — Highlight accent (HSL: 198, 100%, 61%)
- Orange: `#ffa981` — Warm accent (HSL: 19, 100%, 75%)
- Yellow: `#ffd66e` — Warm highlight (HSL: 43, 100%, 72%)
- Green: `#93e088` — Positive accent (HSL: 113, 59%, 71%)
- Red: `#f92b60` — Alert accent (HSL: 345, 94%, 57%)

### Typography

- **Primary Font (Body)**: Roboto (sans-serif fallback)
- **Alternative Font (Headings/Display)**: Montserrat (sans-serif fallback)
- **Title Color (Light mode)**: Dark Text `#283252`
- **Title Color (Dark mode)**: White Smoke `#fcfcfc`
- **Paragraph Color (Light mode)**: Medium Text `#757a91`
- **Paragraph Color (Dark mode)**: Light Text `#a2a5b9`

## Features

### Smart Font Application

- Applies **Montserrat** to headings and display text
- Applies **Roboto** to body and paragraph text
- Automatically falls back to system sans-serif if custom fonts are unavailable
- Preserves readability across all systems

### Text Styling

- Headings (24pt+): Montserrat, bold, Dark Text `#283252`
- Body text: Roboto, regular, Medium Text `#757a91`
- Smart color selection based on light/dark background context
- Preserves text hierarchy and formatting

### Shape and Accent Colors

- Primary actions use `#8217fd` (purple-violet)
- Secondary actions use `#e32b6b` (pink-red)
- Non-text decorative shapes cycle through Purple, Blue, Orange accents
- Maintains visual interest while staying on-brand

## Technical Details

### Color Application

- Use hex values for precise brand matching
- Primary gradient suggestion: `linear-gradient(135deg, #8217fd, #e32b6b)`
- Dark mode surfaces use Dark Background `#232326` or Night `#0a0a14`
- Always ensure sufficient contrast: dark text on light backgrounds, light text on dark

### Dark Mode

Tassvision supports a dark mode (`.is-dark` class):
- Background: `#232326`
- Titles: `#fcfcfc`
- Paragraphs: `#a2a5b9`
- Borders: `#393945`
