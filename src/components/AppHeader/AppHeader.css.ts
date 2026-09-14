import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { breakpoint } from '../../theme/tokens/breakpoint';

const {
  theme: {
    divider,
    strokeWeight,
    background,
    minTouchTarget,
    dropShadow,
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
// Figma's breakpoint sheet (node 14147:8539) collapses the site name and the
// generic `actions` slot together at sm/xs: the site name disappears
// entirely and `actions` moves into the popover menu — both share this threshold.
const wideEnoughForSiteNameAndActions = `screen and (min-width: ${breakpoint.md.appWidth})`;

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

// Single-row's row, and its Left/Right sections below (singleRowLeftSection,
// singleRowRightSection): Figma gaps all three with the grid's layout/gutter
// (32/24/16 at xl/lg/md), not appHeader.spacing — verified against nodes
// 14147:8543/14147:10912/14147:10973.
export const singleRowRow = style([row, { gap: appHeader.rowGap }]);

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

// Single-row-only gap override for leftSection/rightSection — see the
// comment on singleRowRow above.
export const singleRowLeftSection = style([leftSection, { gap: appHeader.rowGap }]);
export const singleRowRightSection = style([rightSection, { gap: appHeader.rowGap }]);

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
// between 1024 and 1440 the menu trigger exists *and* the inline copy is
// visible, so without this an open menu puts a second nav with the same
// accessible name into the tree.
export const menuLanguages = style({
  borderTop: `${strokeWeight} solid ${divider}`,
  marginTop: appHeader.spacing,
  paddingTop: appHeader.spacing,
  '@media': { [inlineLanguagesWidth]: { display: 'none' } },
});

// The popover panel itself (Figma's "Main menu", nodes 10718:2886/10718:4713):
// a fixed ~400px box anchored under the trigger at md+, full viewport width
// below it — those are the only two widths Figma provides frames for, so the
// md threshold (already used for actions/site-name collapse) is a best-effort
// stand-in rather than a verified intermediate breakpoint.
const narrowMenuWidth = `screen and (max-width: ${parseInt(breakpoint.md.appWidth) - 1}px)`;

export const menuDropdown = style({
  background: background.default,
  border: `${strokeWeight} solid ${divider}`,
  boxShadow: `0 1px 4px ${dropShadow}`,
  padding: appHeader.padding.horizontal,
  width: '400px',
  maxWidth: '100vw',
  '@media': {
    // vanilla-extract's media-query parser rejects calc() inside a media
    // feature, so this can't share `breakpoint.md.appWidth` via calc(); the
    // -1px keeps it from overlapping `wideEnoughForSiteNameAndActions`'s own
    // min-width: md query at exactly 768px.
    [narrowMenuWidth]: {
      width: '100vw',
      padding: 0,
    },
  },
});

// Popover.Dropdown itself (not menuDropdown above, which is an inner div
// that owns all the visible box styling) — just a positioning shell, so
// Mantine's own default dropdown padding is cleared here. Mantine positions
// it with an inline `left` from floating-ui's `shift` middleware, which only
// approximately clamps to the viewport edge (a few px of padding). Figma's
// 320 frame wants it flush at 0, so this forces that edge at the same narrow
// breakpoint, overriding the inline style.
export const menuDropdownPositioner = style({
  padding: 0,
  border: 'none',
  '@media': {
    [narrowMenuWidth]: { left: '0px !important' },
  },
});

// Reflow protection shared by both type-scale variants below: as a flex item
// of `leftSection`, this span's own default `min-width: auto` would otherwise
// still hold it — and `leftSection` with it — to its unwrapped text width;
// and `word-break: normal` only wraps at whitespace, so a single long word (a
// Finnish compound is one word with no space to break at) still overflows its
// box even with `min-width: 0` alone — `overflowWrap: anywhere` allows a
// mid-word break as a last resort.
const siteNameBase = style({
  display: 'none',
  minWidth: 0,
  overflowWrap: 'anywhere',
  transform: 'translateY(-2px)',
  '@media': { [wideEnoughForSiteNameAndActions]: { display: 'block' } },
});

export const siteName = style([
  siteNameBase,
  {
    fontSize: typography.h5.fontSize,
    fontFamily: typography.h5.fontFamily,
    fontWeight: typography.h5.fontWeight,
    lineHeight: typography.h5.lineHeight,
  },
]);

// Single-row's Site name resolves to the subheader token in Figma (20px at
// 1440), not h5 (24px) — the two layouts intentionally diverge here.
export const siteNameSubheader = style([
  siteNameBase,
  {
    fontSize: typography.subheader.fontSize,
    fontFamily: typography.subheader.fontFamily,
    fontWeight: typography.subheader.fontWeight,
    lineHeight: typography.subheader.lineHeight,
  },
]);

// Wraps the inline `actions` render when a menu exists to carry it below
// md — mirrors inlineLanguages/menuLanguages. Without a menu, `actions`
// renders unwrapped and always inline (see AppHeader.tsx's `hasMenu` guard).
export const inlineActions = style({
  display: 'none',
  '@media': { [wideEnoughForSiteNameAndActions]: { display: 'block' } },
});

// The popover's own copy of `actions`, shown only while it has moved there
// (below md) — the mirror image of inlineActions, same as menuLanguages
// mirrors inlineLanguages.
export const menuActions = style({
  '@media': { [wideEnoughForSiteNameAndActions]: { display: 'none' } },
});

export const searchContainer = style({
  display: 'flex',
  maxWidth: appHeader.searchMaxWidth,
  width: '100%',
  minWidth: 0,
});
