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
import { containerQueryBreakpoint } from '../../theme/tokens/breakpoint';

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
//
// One addition over Card's own `root`: `height: 100%`. Card's `root` sits
// directly on the stretched flex/grid item (Paper) itself, so a parent row
// of equal-height cards stretches it for free and `content`'s `flex: 1 0 0`
// fills the box. Linkbox's `root` lives one level *down*, on an inner `<div>`
// (see `leftMarker` below and Linkbox.tsx), and an `auto`-height div isn't
// stretched by anything — without this, a Linkbox in a stretched flex/grid
// row only grows to its content's intrinsic height, leaving bare surface
// below the media/icon row instead of filling the box.
export const root = style([cardRoot, { height: '100%' }]);
export const media = cardMedia;
export const content = cardContent;
// Card exposes `sm`/`md`/`lg` padding via its own `size` prop; Linkbox has no
// equivalent size variant, so it always uses Card's `md` tier.
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
// color when `inverted`. `inverted` alone (not compounded with `root`) is
// enough to scope this to Linkbox instances — it's a Linkbox-local marker,
// and `root` lives on a different (inner) element now (see `leftMarker`
// below), so the two are no longer ever on the same element.
const invertibleTextSelectors = Object.values(typography)
  .map((className) => `${inverted} .${className}`)
  .join(', ');

globalStyle(invertibleTextSelectors, { color: `${contrast} !important` });
globalStyle(`${inverted} .${iconRow}`, { color: contrast });

// The whole box is a real `<a>` — Paper's `component="a"`. The overlay tint
// is applied via `backgroundImage` (a same-color-stop linear-gradient), not
// `backgroundColor`: `link` is on the exact same element as Paper's own
// `background-color` (white or, when `inverted`, turquoise), so a translucent
// `backgroundColor` here would replace that opaque color outright rather than
// tint over it — e.g. `rgba(255,255,255,0.1)` on the turquoise surface drops
// it to ~10% opacity, nearly invisible against the page behind it.
// `backgroundImage` paints on top of `backgroundColor` (CSS's own layering
// order) without touching the color underneath.
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
globalStyle(`${inverted}.${link}:hover`, {
  backgroundImage: `linear-gradient(${hover.overlayContrast}, ${hover.overlayContrast})`,
});
globalStyle(`${inverted}.${link}:focus-visible`, {
  backgroundImage: `linear-gradient(${hover.overlayContrast}, ${hover.overlayContrast})`,
});

// `left` media placement is a 50/50 row split above the `md` breakpoint —
// below that, Linkbox's own rendered width has narrowed enough that a row
// split gets cramped, so it collapses to the same stacked layout `top` uses
// by default (no override needed for the stacked state itself — that's just
// `root`'s unconditional base `flexDirection: column`).
//
// This is the first component in the repo to use a real `@container` query
// in its own stylesheet — every other breakpoint-dependent value comes from
// `vars.theme` swapping at `:root` (theme.css.ts), which works for a value
// swap but not a structural row↔column switch. Deliberately scoped to this
// component's own `leftMarker` (never applied to Card's `rootMediaLeft`), so
// Card's own `left` placement — which stays row at every viewport width — is
// untouched.
//
// A container query, not a viewport `@media` query: `leftMarker` establishes
// itself as the query container (`containerType: 'inline-size'`), so the
// collapse is keyed off Linkbox's own rendered width, not the browser
// viewport. A `left`-placed Linkbox squeezed into a narrow grid column
// collapses correctly even on a wide screen — the gap a `@media` version of
// this rule would have left open (Card's own `left` placement still has that
// gap, since it never collapses at all, at any width or container size).
//
// `leftMarker` is on the outer element (Paper/the `<a>` itself); `root` is
// the *inner* flex wrapper one level down (see Linkbox.tsx) — deliberately
// two different elements. Container queries cannot restyle the element that
// establishes the container itself — a documented, cross-engine restriction
// of the feature, not a browser-specific gap — so `root` has to be a genuine
// descendant of `leftMarker`, not the same element being queried.
//
// `width: '100%'` is required, not cosmetic: inline-size containment computes
// the container's own inline size as though it had no content, so without an
// explicit width a `left`-placed Linkbox used as a flex item (the common case
// — a row of cards) collapses to 0 width instead of sharing the row (verified
// in Chromium: 0px vs. 226px for an otherwise-identical `top`-placed sibling).
// A plain block-flow parent doesn't hit this — its `width: auto` already
// fills the containing block regardless of content — which is why it went
// unnoticed: every existing story wraps the box in a plain (non-flex) div.
export const leftMarker = style({ containerType: 'inline-size', width: '100%' });

// Intentionally not `breakpoint.md.appWidth` (the responsive viewport
// breakpoint table in `theme/tokens/breakpoint.ts`, swapped in via CSS custom
// properties at `:root`): `@container` conditions require a literal length,
// not a `var()` reference, and — more importantly — this threshold is a
// Linkbox-local layout decision (a 50/50 row split gets cramped below this
// container width), not the site's responsive viewport grid. Reusing the
// viewport token would silently retune this component's own collapse point
// any time the design system's `md` breakpoint changes for unrelated reasons.
const wideEnoughForRowSplit = `(min-width: ${containerQueryBreakpoint.md})`;

globalStyle(`${leftMarker} > ${root}`, {
  '@container': { [wideEnoughForRowSplit]: { flexDirection: 'row' } },
});
globalStyle(`${leftMarker} ${media}`, {
  '@container': {
    [wideEnoughForRowSplit]: { aspectRatio: 'auto', flex: `0 0 ${card.mediaSplit}` },
  },
});
globalStyle(`${leftMarker} ${content}`, {
  '@container': { [wideEnoughForRowSplit]: { flex: `0 0 ${card.mediaSplit}` } },
});
