import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { typography } from '../Typography/Typography.css';
import { textBlock as cardTextBlock } from '../Card/Card.css';

const {
  theme: {
    text,
    contrast,
    hover,
    focusRing,
    components: { card },
  },
} = vars;

// Reuse Card's eyebrow/title/body gap (Figma's "Spacing/2-extra-small", 8px) —
// Linkbox's own eyebrow/title/description stack matches that exactly.
export const textBlock = cardTextBlock;

export const root = style({ display: 'flex', flexDirection: 'column', gap: card.spacing });

// Figma's "Kuvaava teksti" (P1) is styled with text/secondary, not
// Typography's own p1 default (text/primary) — only the description needs
// this override; the eyebrow (P2) and title (H3) already default to
// text/secondary and text/header respectively.
export const description = style({ color: text.secondary });

// Icon row sits below the text block, matching Figma's arrow position.
export const iconRow = style({ display: 'flex', alignItems: 'center', color: text.header });

export const icon = style({ width: '1.5rem', height: '1.5rem' });

// Marker class toggled when `inverted` — no rule of its own (the background
// color itself comes from Paper's `background="turquoise"`), just a hook for
// the invertible text/icon selectors below. Same technique as Card.css.ts's
// `inverted` marker.
export const inverted = style({});

// Same allowlist-driven inversion technique as Card.css.ts's
// `invertibleSelectors` — flips Linkbox's own text/icon to the contrast
// color when `inverted`.
const invertibleTextSelectors = Object.values(typography)
  .map((className) => `${root}${inverted} .${className}`)
  .join(', ');

globalStyle(invertibleTextSelectors, { color: `${contrast} !important` });
globalStyle(`${root}${inverted} .${iconRow}`, { color: contrast });

// The whole box is a real `<a>` — Paper's `component="a"`. The overlay tint
// is applied via `backgroundImage` (a same-color-stop linear-gradient), not
// `backgroundColor`: `link` is on the exact same element as Paper's own
// `background-color` (white or, when `inverted`, turquoise), so setting
// `backgroundColor` here would replace that opaque color outright rather
// than tint over it — a translucent `rgba(255,255,255,0.1)` `backgroundColor`
// on the turquoise surface once erased it down to ~10% opacity, making the
// whole box nearly disappear against the page behind it. `backgroundImage`
// paints on top of `backgroundColor` (CSS's own layering order) without
// touching the color underneath.
export const link = style({
  textDecoration: 'none',
  selectors: {
    '&:hover': { backgroundImage: `linear-gradient(${hover.overlay}, ${hover.overlay})` },
    '&:focus-visible': {
      ...focusRing,
      backgroundImage: `linear-gradient(${hover.overlay}, ${hover.overlay})`,
    },
  },
});

// Only the tint differs when `inverted` — Figma's own Focus-visible/Outline
// variable is the same dark #1e1e22 for both the Default and Inverted focus
// cells (confirmed against the "Card link content" Figma frame), so the
// outline itself doesn't need an inverted override the way e.g. Card's
// nested TextLink focus ring does against its own (different) backgrounds.
globalStyle(`${root}${inverted}.${link}:hover`, {
  backgroundImage: `linear-gradient(${hover.overlayContrast}, ${hover.overlayContrast})`,
});
globalStyle(`${root}${inverted}.${link}:focus-visible`, {
  backgroundImage: `linear-gradient(${hover.overlayContrast}, ${hover.overlayContrast})`,
});
