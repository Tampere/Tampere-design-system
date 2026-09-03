import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { typography } from '../Typography/Typography.css';
import { link } from '../TextLink/TextLink.css';
import { paddingVariants } from '../Paper/Paper.css';

const {
  theme: {
    components: { card },
    contrast,
    focus,
  },
} = vars;

export const root = style({ display: 'flex', flexDirection: 'column' });

export const rootMediaLeft = style({ flexDirection: 'row' });

// `minWidth`/`minHeight: 0` let the wrapper shrink below its content's intrinsic
// size instead of overflowing (needed in the `left` row layout, where `media` is
// a fixed `flex: 0 0 50%` column — see below). `overflow: hidden` is a second,
// independent guard: even a correctly-shrunk wrapper doesn't clip an oversized
// descendant on its own.
//
// `top` placement additionally fixes the wrapper to a 3:2 box (photos'
// conventional crop ratio) — without it, the wrapper's height is undefined
// (nothing else in the column layout gives it one) and would collapse to 0 now
// that the media element itself is sized off the wrapper, not its own intrinsic
// size (see the `img`/`video`/`svg` rule below). `left` placement doesn't need
// this: its wrapper already gets a height for free by stretching to match
// `content`'s row height (default flex align-items: stretch).
export const media = style({
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
  aspectRatio: card.mediaAspectRatio,
});

// Media content (an `<img>`, or any other element a consumer passes) has no
// intrinsic constraint of its own — without `width`/`height: 100%`, an image
// smaller than the wrapper (e.g. a thumbnail narrower than the card) rendered
// at its own intrinsic size instead of filling the frame, leaving visible gaps
// beside/below it. `object-fit: cover` crops rather than stretches, so a source
// image's own aspect ratio never distorts to fit the wrapper's. A descendant
// selector (not `> *`) so the constraint reaches the actual media element even
// when a consumer wraps it (e.g. `<picture><img/></picture>`).
globalStyle(`${media} img, ${media} video, ${media} svg`, {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

// Card's size scale (`sm`/`md`/`lg`) is the same padding scale Paper already
// exposes — reuse it directly rather than re-declaring an identical variant map.
export const contentPaddingVariants = paddingVariants;

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  // Default (no media, or `top` placement): grow to fill the column's
  // leftover space. Overridden to `0 0 50%` in the `left` row layout below.
  flex: '1 0 0',
  minWidth: 0,
  gap: card.spacing,
});

// Explicit `50%` rather than an equal `flex-grow` split: with `content`
// carrying padding and `media` carrying none, growing both from an equal
// `flex-basis` doesn't actually land them at equal final widths — a
// `flex-basis: 0`/`0%` target is still a border-box size, so the growth
// algorithm effectively gives the padded item a head start before growth is
// distributed. `flex: 0 0 50%` sidesteps that: each side's final width is the
// fixed value itself, not a computed target, so the split is exact regardless
// of either side's padding.
globalStyle(`${rootMediaLeft} > ${media}`, {
  aspectRatio: 'auto',
  flex: `0 0 ${card.mediaSplit}`,
});
globalStyle(`${rootMediaLeft} > ${content}`, { flex: `0 0 ${card.mediaSplit}` });

export const textBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: card.textContentSpacing,
});

// Marker class, toggled on `content` when `background !== 'default'` — no rule of
// its own, just a hook for the `globalStyle` selector below.
export const inverted = style({});

// Typography's variants and TextLink's link states each set `color` directly on
// their own class, so a parent-level color doesn't inherit through — each has to
// be targeted explicitly. This is deliberately an allowlist (Typography + TextLink
// only), not `*`: a blanket selector would also force-invert any other component a
// consumer nests in `children`/`actions` (e.g. a `Chip`, which has its own light
// surface — forcing its label white would make it unreadable against its own
// background, not the Card's). Covers both `textBlock` (eyebrow/title/body) and
// `actions`, since a plain-text `actions` slot (e.g. a "read more" TextLink) should
// invert the same way; a `Button` in either slot is simply never in this list, so
// its own color/border pairing stays intact without needing an explicit exclusion.
const invertibleSelectors = [...Object.values(typography), ...Object.values(link)]
  .map((className) => `${content}${inverted} .${className}`)
  .join(', ');

// `!important` isn't required to beat Typography/TextLink's own class on
// specificity (a two-class ancestor selector already outranks their single
// class), but is kept defensively against a same-specificity rule declared
// later in source order (e.g. a consumer `className` override), which would
// otherwise win the cascade regardless of specificity.
globalStyle(invertibleSelectors, { color: `${contrast} !important` });

// TextLink is the only one of the two that spreads `focusRing` for
// `:focus-visible` — Typography elements aren't natively focusable and never
// match this selector, but it's built from the same allowlist as the color
// override above for consistency. TextLink's neutral outline (`focus.visible`,
// #1e1e22) fails WCAG's 3:1 non-text-contrast minimum against Card's colored
// backgrounds (#116) — override just the color (width/offset already match)
// to the same inverted tone used above, scoped to `:focus-visible` so it only
// fires on colored Cards.
const invertibleFocusSelectors = [...Object.values(typography), ...Object.values(link)]
  .map((className) => `${content}${inverted} .${className}:focus-visible`)
  .join(', ');

globalStyle(invertibleFocusSelectors, { outlineColor: `${focus.visibleInverted} !important` });
