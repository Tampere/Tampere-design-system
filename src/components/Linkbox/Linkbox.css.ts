import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { typography } from '../Typography/Typography.css';
import {
  textBlock as cardTextBlock,
  root as cardRoot,
  media as cardMedia,
  content as cardContent,
  contentPaddingVariants,
} from '../Card/Card.css';
import { breakpoint } from '../../theme/tokens/breakpoint';

const {
  theme: {
    text,
    contrast,
    hover,
    focusRing,
    components: { card, icon: iconTokens },
  },
} = vars;

// Reuse Card's eyebrow/title/body gap (Figma's "Spacing/2-extra-small", 8px) —
// Linkbox's own eyebrow/title/description stack matches that exactly.
export const textBlock = cardTextBlock;

// Reused wholesale from Card — Linkbox's own root/media/content/padding
// structure is identical to Card's: `root` is a plain column flex container,
// `media` is a fixed 3:2 box (or `auto` + a flex-basis split under Card's own
// `rootMediaLeft`, which Linkbox never imports/applies) that bleeds to the
// edge, and `content` is the padded text-content block that fills whatever
// space `media` doesn't take. Only the `left`-placement responsive collapse
// below is Linkbox-specific — Card's own `left` placement stays row at every
// breakpoint; that behaviour is untouched since Linkbox never applies Card's
// `rootMediaLeft` class.
export const root = cardRoot;
export const media = cardMedia;
export const content = cardContent;
export const contentPadding = contentPaddingVariants.md;

// Figma's "Kuvaava teksti" (P1) is styled with text/secondary, not
// Typography's own p1 default (text/primary) — only the description needs
// this override; the eyebrow (P2) and title (H3) already default to
// text/secondary and text/header respectively.
export const description = style({ color: text.secondary });

// Icon row sits below the text block, matching Figma's arrow position.
export const iconRow = style({ display: 'flex', alignItems: 'center', color: text.header });

export const icon = style({ width: iconTokens.size.large, height: iconTokens.size.large });

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

// `left` media placement is a 50/50 row split above the `md` breakpoint —
// below that, the whole card has narrowed enough that a row split gets
// cramped, so it collapses to the same stacked layout `top` uses by default
// (no override needed for the stacked state itself — that's just `root`'s
// unconditional base `flexDirection: column`).
//
// This is the first component in the repo to use a real `@media` query in
// its own stylesheet — every other breakpoint-dependent value comes from
// `vars.theme` swapping at `:root` (theme.css.ts), which works for a value
// swap but not a structural row↔column switch. Deliberately scoped to this
// component's own `leftMarker` (never applied to Card's `rootMediaLeft`), so
// Card's own `left` placement — which stays row at every breakpoint — is
// untouched.
//
// Viewport-based, not a container query (none exist yet in this repo): a
// `left`-placed Linkbox squeezed into a narrow grid column on a wide
// viewport still renders row layout. Known limitation, not a regression —
// Card's own `left` placement never collapses at all, at any width.
export const leftMarker = style({});

const wideEnoughForRowSplit = `screen and (min-width: ${breakpoint.md.appWidth})`;

globalStyle(leftMarker, {
  '@media': { [wideEnoughForRowSplit]: { flexDirection: 'row' } },
});
globalStyle(`${leftMarker} > ${media}`, {
  '@media': {
    [wideEnoughForRowSplit]: { aspectRatio: 'auto', flex: `0 0 ${card.mediaSplit}` },
  },
});
globalStyle(`${leftMarker} > ${content}`, {
  '@media': { [wideEnoughForRowSplit]: { flex: `0 0 ${card.mediaSplit}` } },
});
