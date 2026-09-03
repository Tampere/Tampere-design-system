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
    focusRingInverted,
    components: { card },
  },
} = vars;

// Reuse Card's eyebrow/title/body gap (Figma's "Spacing/2-extra-small", 8px) —
// Linkbox's own eyebrow/title/description stack matches that exactly.
export const textBlock = cardTextBlock;

// Root needs `position: relative` so the nested-interactive overlay `<a>`
// (`overlayLink` below) can size itself via `inset: 0` against this box
// rather than the page.
export const root = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: card.spacing,
});

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
// color when `inverted`, without a blanket selector that would also force
// invert something a consumer nests in `actions`.
const invertibleTextSelectors = Object.values(typography)
  .map((className) => `${root}${inverted} .${className}`)
  .join(', ');

globalStyle(invertibleTextSelectors, { color: `${contrast} !important` });
globalStyle(`${root}${inverted} .${iconRow}`, { color: contrast });

// ── Simple mode: the root itself is the `<a>` ────────────────────────────
export const link = style({
  textDecoration: 'none',
  selectors: {
    '&:hover': { backgroundColor: hover.overlay },
    '&:focus-visible': { ...focusRing, backgroundColor: hover.overlay },
  },
});

globalStyle(`${root}${inverted}.${link}:hover`, { backgroundColor: hover.overlayContrast });
globalStyle(`${root}${inverted}.${link}:focus-visible`, {
  ...focusRingInverted,
  backgroundColor: hover.overlayContrast,
});

// ── Nested-interactive mode: a covering overlay `<a>`, plus a positioned
// content wrapper so the real content/actions paint above it ────────────
export const overlayLink = style({
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  textDecoration: 'none',
  selectors: {
    '&:hover': { backgroundColor: hover.overlay },
    '&:focus-visible': { ...focusRing, backgroundColor: hover.overlay },
  },
});

globalStyle(`${root}${inverted} .${overlayLink}:hover`, { backgroundColor: hover.overlayContrast });
globalStyle(`${root}${inverted} .${overlayLink}:focus-visible`, {
  ...focusRingInverted,
  backgroundColor: hover.overlayContrast,
});

// `zIndex: 1` puts `content`/`actions` above `overlayLink` so a real pointer
// click over e.g. a nested Button hits the button, not the covering link —
// not caught by `ActionsRemainClickable`'s `userEvent.click` (which targets
// the button node directly rather than hit-testing screen coordinates, the
// same synthetic-event gap TextLink.css.ts documents for `:hover`); verified
// manually via Storybook instead.
//
// Also carries its own flex-column + `card.spacing` gap: wrapping `content`
// (textBlock + iconRow) in this div for the z-index above otherwise strands
// them in plain block flow, losing the gap `root`'s own flex layout gives
// its *direct* children — regression caught visually in Storybook (nested
// mode's arrow sat flush against the description instead of Figma's 24px
// gap). Reused for the `actions` wrapper too, where a single child is
// unaffected and multiple children get the same sensible stacking.
export const positionedContent = style({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: card.spacing,
});
