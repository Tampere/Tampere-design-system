import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: { components, states, focusRing },
} = vars;

export const externalIcon = style({
  display: 'inline-block',
  verticalAlign: 'middle',
  // Nudges the icon up to visually balance it against the underline — the
  // icon's viewBox has no internal padding, so at `middle` alignment its
  // bottom edge otherwise hangs below the underline. `position: relative`
  // shifts it purely visually; the element still reserves its original box
  // for layout, so line-height is unaffected even in wrapped paragraphs.
  position: 'relative',
  top: components.link.iconVerticalOffset,
  width: components.link.iconSize,
  height: components.link.iconSize,
  marginLeft: components.link.iconSpacing,
});

// Screen-reader-only text — visually hidden but still announced. Mirrors
// DateField.css.ts's `visuallyHidden` (no shared helper exists yet).
export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
});

export type TextLinkSize = Exclude<keyof typeof components.typography, 'margin'>;

function sizeStyle(size: TextLinkSize) {
  const { fontFamily, fontSize, fontWeight, lineHeight } = components.typography[size];
  return { fontFamily, fontSize, fontWeight, lineHeight };
}

export const size = styleVariants({
  h1: sizeStyle('h1'),
  h2: sizeStyle('h2'),
  h3: sizeStyle('h3'),
  h4: sizeStyle('h4'),
  h5: sizeStyle('h5'),
  subheader: sizeStyle('subheader'),
  p1: sizeStyle('p1'),
  p2: sizeStyle('p2'),
  caption: sizeStyle('caption'),
});

// `:hover` isn't asserted in stories — synthetic pointer events don't move the
// OS cursor in this repo's Playwright/Chromium test environment, so `:hover`
// can't be reliably exercised (same known gap as LabeledIconButton.stories.tsx).
export const link = styleVariants({
  unvisited: {
    color: states.default,
    textDecoration: 'underline',
    textDecorationThickness: components.link.underlineThickness,
    selectors: {
      '&:hover': {
        color: states.hover,
        textDecoration: 'underline',
        textDecorationThickness: components.link.hoverUnderlineThickness,
      },
      '&:focus-visible': {
        ...focusRing,
        color: states.focus,
        textDecoration: 'underline',
        textDecorationThickness: components.link.hoverUnderlineThickness,
      },
    },
  },
  visited: {
    color: states.visited,
    textDecoration: 'underline',
    textDecorationThickness: components.link.underlineThickness,
    selectors: {
      '&:hover': {
        color: states.visited,
        textDecoration: 'underline',
        textDecorationThickness: components.link.hoverUnderlineThickness,
      },
      '&:focus-visible': {
        ...focusRing,
        color: states.visited,
        textDecoration: 'underline',
        textDecorationThickness: components.link.hoverUnderlineThickness,
      },
    },
  },
});
