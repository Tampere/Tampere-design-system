import { style } from '@vanilla-extract/css';

// Clips content to a 1px box while keeping it in the accessibility tree and the tab
// order — used for screen-reader-only text (TextLink, DateField) and, via a consumer's
// own `:focus-visible` override, for a skip link that only becomes visible once focused
// (SkipLink). No design tokens involved — every value here is a structural CSS technique,
// not a themeable one.
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
