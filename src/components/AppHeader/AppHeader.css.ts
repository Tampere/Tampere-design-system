import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { breakpoint } from '../../theme/tokens/breakpoint';

const {
  theme: {
    divider,
    strokeWeight,
    background,
    minTouchTarget,
    components: { appHeader, typography },
  },
} = vars;

// Deliberately the real viewport token, unlike Linkbox's component-local
// `containerQueryBreakpoint`: AppHeader is page chrome and its collapse point
// *is* the site's responsive grid (Figma node 5870:42434 — inline nav exists
// only at 1440), so it should follow xl if xl is ever retuned. A `var()`
// reference cannot work here; media conditions require a literal length.
const inlineNavWidth = `screen and (min-width: ${breakpoint.xl.appWidth})`;
const wideEnoughForSecondaryLogo = `screen and (min-width: ${breakpoint.sm.appWidth})`;
const inlineLanguagesWidth = `screen and (min-width: ${breakpoint.lg.appWidth})`;

export const navList = style({
  display: 'flex',
  alignItems: 'center',
  gap: appHeader.spacing,
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const navItem = style({ display: 'flex' });

// NavigationLink's own `sm` size sizes to its text (p2 line-height + a 2px
// bottom border, no padding) — ~23px at the xs/sm breakpoints, under the
// kit's 24px touch-target floor. Applied only to the language links here
// rather than widening NavigationLink itself, which would resize every other
// `sm` consumer.
export const languageLink = style({ minHeight: minTouchTarget });

export const menuButton = style({
  // `!important`: LabeledIconButton's own `root` class sets an unconditional
  // `display: flex` at the same (0,1,0) specificity; without it, whichever
  // class's CSS happens to land later in the bundle wins, regardless of this
  // media query. The compound-selector remedy Button.css.ts uses for its own
  // `tertiary`/`pill` conflict isn't available here: that trick needs a
  // selector built from the button's `root` class, which neither button
  // component exports.
  '@media': { [inlineNavWidth]: { display: 'none !important' } },
});

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: appHeader.spacing,
  padding: `${appHeader.padding.vertical} ${appHeader.padding.horizontal}`,
  background: background.default,
  borderBottom: `${strokeWeight} solid ${divider}`,
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: appHeader.spacing,
  // `siteName` is free consumer text with no length limit, so at narrow
  // widths it (and the row generally) needs to wrap rather than force the
  // header wider than the viewport (WCAG 1.4.10 Reflow).
  flexWrap: 'wrap',
});

export const leftSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: appHeader.spacing,
  // Flex children default to `min-width: auto`, i.e. their content's
  // intrinsic width — without this, a long `siteName` (or any child here)
  // keeps the row from shrinking below that width, overflowing at narrow
  // viewports instead of wrapping.
  minWidth: 0,
});

export const rightSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: appHeader.spacing,
  minWidth: 0,
});

export const brandLink = style({ display: 'flex', alignItems: 'center' });

export const primaryLogo = style({
  height: appHeader.logo.primaryHeight,
  width: 'auto',
});

export const secondaryLogo = style({
  display: 'none',
  height: appHeader.logo.secondaryHeight,
  width: 'auto',
  '@media': { [wideEnoughForSecondaryLogo]: { display: 'block' } },
});

export const inlineNav = style({
  display: 'none',
  '@media': { [inlineNavWidth]: { display: 'block' } },
});

export const inlineLanguages = style({
  display: 'none',
  '@media': { [inlineLanguagesWidth]: { display: 'block' } },
});

// The mirror of `inlineLanguages`, and load-bearing rather than cosmetic:
// between 1024 and 1440 the drawer trigger exists *and* the inline copy is
// visible, so without this an open drawer puts a second nav with the same
// accessible name into the tree.
export const drawerLanguages = style({
  borderTop: `${strokeWeight} solid ${divider}`,
  marginTop: appHeader.spacing,
  paddingTop: appHeader.spacing,
  '@media': { [inlineLanguagesWidth]: { display: 'none' } },
});

export const siteName = style({
  fontSize: typography.h5.fontSize,
  fontFamily: typography.h5.fontFamily,
  fontWeight: typography.h5.fontWeight,
  lineHeight: typography.h5.lineHeight,
  // Same reflow fix as `leftSection`, one level down: as a flex item of
  // `leftSection`, this span's own default `min-width: auto` would otherwise
  // still hold it — and `leftSection` with it — to its unwrapped text width.
  minWidth: 0,
  // `word-break: normal` only wraps at whitespace, so a single long word (a
  // Finnish compound is one word with no space to break at) still overflows
  // its box even with `min-width: 0` above — allow a mid-word break as a
  // last resort once whitespace-wrapping alone can't fit it.
  overflowWrap: 'anywhere',
});

export const searchContainer = style({
  display: 'flex',
  maxWidth: appHeader.searchMaxWidth,
  width: '100%',
  minWidth: 0,
});
