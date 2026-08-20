import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: { components, states, focusRing },
} = vars;

export const externalIcon = style({
  display: 'inline-block',
  verticalAlign: 'middle',
  width: '1em',
  height: '1em',
  marginLeft: components.link.spacing,
});

type Size = Exclude<keyof typeof components.typography, 'margin'>;

function sizeStyle(size: Size) {
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
    selectors: {
      '&:hover': { color: states.hover, textDecoration: 'none' },
      '&:focus-visible': { ...focusRing, color: states.focus, textDecoration: 'underline' },
    },
  },
  visited: {
    color: states.visited,
    textDecoration: 'underline',
    selectors: {
      '&:hover': { color: states.visited, textDecoration: 'none' },
      '&:focus-visible': { ...focusRing, color: states.visited, textDecoration: 'underline' },
    },
  },
});
