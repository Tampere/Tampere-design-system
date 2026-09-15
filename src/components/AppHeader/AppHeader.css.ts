import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { breakpoint } from '../../theme/tokens/breakpoint';

const {
  theme: {
    divider,
    strokeWeight,
    background,
    minTouchTarget,
    dropShadowTile,
    focusRing,
    components: { appHeader, appHeaderMenu, typography },
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

// Applied only when a language link is the current one — see
// AppHeaderLanguages.tsx. Separate from NavigationLink's own `selected`
// variant (border-bottom only) since this weight bump is specific to the
// language switcher, not every selected NavigationLink in the library.
export const languageLinkSelected = style({
  fontWeight: appHeader.language.selectedFontWeight,
});

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
  // Positioning context for menuAnchor below — the popover menu anchors to
  // the header's own bottom-right corner, not the trigger button's.
  position: 'relative',
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

// Multi-row's second row (search + primary nav/menu, node 14151:15442) is
// gapped with the same grid layout/gutter as singleRowRow above, not
// appHeader.spacing — scoped to this row only (not the shared `row` class
// multi-row's first row also uses) since only this gap was reported off.
export const multiRowSearchRow = style([row, { gap: appHeader.rowGap }]);

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

export const brandLink = style({
  display: 'flex',
  alignItems: 'center',
  selectors: { '&:focus-visible': focusRing },
});

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

// Multi-row's secondary navigation (Figma node 14151:15442's "Secondary
// navigation") collapses at the same threshold as languages — present at the
// 1440/1024 frames, gone at 768 and below.
export const inlineSecondaryNav = style({
  display: 'none',
  '@media': { [inlineLanguagesWidth]: { display: 'block' } },
});

// The mirror of `inlineLanguages`, and load-bearing rather than cosmetic:
// between 1024 and 1440 the menu trigger exists *and* the inline copy is
// visible, so without this an open menu puts a second nav with the same
// accessible name into the tree.
export const menuLanguages = style({
  padding: `${appHeaderMenu.sectionPadding.vertical} ${appHeaderMenu.sectionPadding.horizontal}`,
  '@media': { [inlineLanguagesWidth]: { display: 'none' } },
});

// The popover's own copy of secondary navigation — mirrors menuLanguages'
// relationship to inlineLanguages, but composed alongside `menuNav` (not
// `menuNav`'s own padding duplicated here) so its `<ul>` also gets menuNav's
// globalStyle vertical-list treatment below, the same way the primary nav's
// own popover copy does.
export const menuSecondaryNavVisibility = style({
  '@media': { [inlineLanguagesWidth]: { display: 'none' } },
});

// The popover panel itself (Figma's "Main menu", node 14187:18169): a fixed
// 284px box anchored under the trigger at md+, full *header* width below it
// (per the 320 breakpoint frame, node 14187:18349, which embeds the menu at
// the header's own full width) — the md threshold (already used for
// actions/site-name collapse) is a best-effort stand-in for the boundary
// itself, since Figma provides no intermediate frame to verify it against.
// Below md, AppHeaderMenu.tsx passes `width="target"` to Mantine's Popover,
// which measures menuAnchor's *actual* width and sets it as an inline style
// on Popover.Dropdown's own root (menuDropdownPositioner below) — not on
// this element, which is a plain child of that root, so it still needs its
// own `width: 100%` to actually fill whatever pixel width its parent
// resolved to. Without either, `100vw`/a fixed viewport guess would assume
// the header sits flush against the viewport (it doesn't in Storybook's own
// preview, which wraps every story in a margin, and a consumer may wrap it
// in a padded or max-width shell too).
const narrowMenuWidth = `screen and (max-width: ${parseInt(breakpoint.md.appWidth) - 1}px)`;

export const menuDropdown = style({
  background: background.default,
  boxShadow: dropShadowTile,
  width: appHeaderMenu.width,
  maxWidth: '100vw',
  '@media': {
    [narrowMenuWidth]: { width: '100%' },
  },
});

// Nav links stack vertically inside the menu (node 14187:18169) unlike the
// horizontal `navList` row used inline in the header — scoped to this class's
// own `<ul>` rather than changing `navList` itself, which the inline copy
// still needs as a row.
export const menuNav = style({
  padding: `${appHeaderMenu.sectionPadding.vertical} ${appHeaderMenu.sectionPadding.horizontal}`,
});
globalStyle(`${menuNav} ul`, {
  flexDirection: 'column',
  alignItems: 'flex-start',
});

// Separate from `menuNav` above and applied only when AppHeaderMenu.tsx knows
// an Actions section will actually render right below it (`actions?.length`)
// — the divider exists to separate Nav from Actions, so it shouldn't appear
// when there's nothing there to separate from. Even then, Actions moves back
// into the inline row at the same threshold as `menuActions`'s own
// `display: none`, so the divider must disappear there too, or Nav ends up
// with a dangling bottom stroke and nothing below it.
export const menuNavDivider = style({
  borderBottom: `${strokeWeight} solid ${divider}`,
  '@media': { [wideEnoughForSiteNameAndActions]: { borderBottom: 'none' } },
});

// Same rule as menuNavDivider but held until lg: `secondaryNavigation` stays
// in the menu until inlineLanguagesWidth, so a divider above it that cleared
// at md would leave the two sections butted together between 768 and 1023.
export const menuNavDividerThroughSecondaryNav = style({
  borderBottom: `${strokeWeight} solid ${divider}`,
  '@media': { [inlineLanguagesWidth]: { borderBottom: 'none' } },
});

// Popover.Dropdown itself (not menuDropdown above, which is an inner div
// that owns all the visible box styling) — just a positioning shell, so
// Mantine's own default dropdown padding is cleared here.
export const menuDropdownPositioner = style({
  padding: 0,
  border: 'none',
});

// The actual Popover.Target anchor, positioned at the header's own
// bottom-right corner (root has `position: relative`) rather than the
// trigger button's, so `offset={0}` lands the dropdown flush with the
// header's bottom stroke instead of the button's bottom edge, which sits
// above it by the header's own vertical padding. The visible trigger button
// stays a normal sibling in the row — Popover.Target injects no props of its
// own here (controlled Popover + withRoles={false}, see AppHeaderMenu.tsx).
//
// `width: 100%` (not 0) — for an absolutely positioned box, percentage width
// resolves against the nearest positioned ancestor's *padding* edge, so this
// spans root's own full visual width exactly, flush at both edges (insetInlineEnd:
// 0 pins the right edge; with width already filling the available span, the
// left edge lands at 0 too, with no separate `insetInlineStart` needed).
// Doesn't change wide-breakpoint alignment at all — `position="bottom-end"`
// only depends on the reference's *right* edge, unaffected by its width — but
// gives AppHeaderMenu.tsx's `width="target"` a real, header-matching size to
// measure below md, instead of the previous `100vw`/`left:0 !important` pair,
// which assumed the header sits flush against the viewport (it doesn't in
// Storybook's own preview, which wraps every story in a margin, and a
// consumer may wrap it in a padded or max-width shell too).
export const menuAnchor = style({
  position: 'absolute',
  insetInlineEnd: 0,
  bottom: `calc(-1 * ${strokeWeight})`,
  width: '100%',
  height: 0,
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
  transform: `translateY(${appHeader.siteName.verticalOffset})`,
  '@media': { [wideEnoughForSiteNameAndActions]: { display: 'block' } },
});

// Site name resolves to the subheader token in Figma (20px at 1440) in both
// layouts — single-row's node 14147:8543 and multi-row's own 14151:15447
// agree on this, so one shared class instead of a layout-specific pair keeps
// them from drifting apart by editing one.
export const siteName = style([
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
  '@media': {
    [wideEnoughForSiteNameAndActions]: {
      display: 'flex',
      alignItems: 'center',
      gap: appHeader.spacing,
    },
  },
});

// The popover's own copy of `actions`, shown only while it has moved there
// (below md) — the mirror image of inlineActions, same as menuLanguages
// mirrors inlineLanguages. Figma's Actions section (node 14187:18242) stacks
// its rows vertically, same as menuNav's `<ul>`.
export const menuActions = style({
  display: 'flex',
  flexDirection: 'column',
  gap: appHeaderMenu.sectionPadding.vertical,
  padding: `${appHeaderMenu.sectionPadding.vertical} ${appHeaderMenu.sectionPadding.horizontal}`,
  '@media': { [wideEnoughForSiteNameAndActions]: { display: 'none' } },
});

// Figma's own search container (node 14151:15442's second row) is `flex:
// 1 0 0` at every breakpoint frame, no max-width — `width: '100%'` alone
// only sets this item's flex-basis, and without flexGrow, `row`'s
// `justify-content: space-between` turns any leftover space into a gap
// *between* this and rightSection rather than stretching this to fill it.
// (The previous `maxWidth: appHeader.searchMaxWidth` token had its
// per-breakpoint values backwards — capped at xl/xxl, uncapped everywhere
// smaller — and matched no Figma frame at any width; removed rather than
// fixed, since Figma specifies no cap at all.)
export const searchContainer = style({
  display: 'flex',
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: 0,
  minWidth: 0,
});
