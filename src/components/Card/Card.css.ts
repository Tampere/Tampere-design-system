import { style, styleVariants, globalStyle } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { card, paper },
    contrast,
  },
} = vars;

export const root = style({ display: 'flex', flexDirection: 'column' });

export const rootMediaLeft = style({ flexDirection: 'row' });

// `flex: 1 0 0` only makes sense on the row axis (an even split with `content`,
// via `rootMediaLeft`) — applied unconditionally it also zeroes the wrapper's
// height in the default column layout, collapsing real media content.
export const media = style({ minWidth: 0, minHeight: 0 });

globalStyle(`${rootMediaLeft} > ${media}`, { flex: '1 0 0' });

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0 0',
  gap: card.spacing,
});

export const contentPaddingVariants = styleVariants({
  large: { padding: paper.padding.large },
  medium: { padding: paper.padding.medium },
  small: { padding: paper.padding.small },
});

export const textBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: card.textContentSpacing,
});

// Marker class, toggled on `textBlock` when `background !== 'default'` — no rule of
// its own, just a hook for the `globalStyle` selector below.
export const inverted = style({});

// Typography's `h2`/`h3`/`p2` variants (and any Typography a consumer nests inside
// `children`) set `color` directly on their own class, so a parent-level color
// doesn't inherit through. `*` inside `textBlock` reaches eyebrow/title *and*
// arbitrary body content alike, without touching `actions` (a sibling, outside
// `textBlock` — its own Button styling must never be forced white). Buttons are
// also excluded here even though `children` can contain them (Card.tsx's own
// `children` doc says so) — a Button's own color/border pairing must stay intact,
// only its text-only siblings (Typography, TextLink) should invert. `!important` is
// needed even with the compound selector, since `.textBlock.inverted *` carries no
// more specificity than Typography's own single class (`*` contributes none) — same
// technique DateField already uses for the same class of problem.
globalStyle(`${textBlock}${inverted} *:not(button):not(button *)`, {
  color: `${contrast} !important`,
});
