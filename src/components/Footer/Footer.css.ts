import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { breakpoint } from '../../theme/tokens/breakpoint';
import { link } from '../TextLink/TextLink.css';
import { typography as typographyClasses } from '../Typography/Typography.css';

const {
  theme: {
    contrast,
    focus,
    components: { footer, typography },
  },
} = vars;

const row = {
  width: '100%',
  maxWidth: footer.contentMaxWidth,
  display: 'flex',
  flexWrap: 'wrap',
} as const;

const barBase = style({
  display: 'flex',
  justifyContent: 'center',
  paddingInline: footer.padding.horizontal,
  backgroundColor: footer.backgroundBottom,
  color: contrast,
});

export const bar = styleVariants({
  default: [barBase, { paddingBlock: footer.padding.verticalBottom }],
  dense: [barBase, { paddingBlock: footer.padding.verticalDense }],
});

export const barContent = style({
  ...row,
  alignItems: 'center',
  columnGap: footer.bottomBar.columnGap,
  rowGap: footer.bottomBar.rowGap,
});

export const coatOfArms = style({
  display: 'block',
  height: footer.coatOfArmsHeight,
  width: 'auto',
});

export const copyright = style({
  ...typography.p2,
  margin: 0,
  color: contrast,
});

export const legalLinks = style({
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: footer.legalLinks.columnGap,
  rowGap: footer.legalLinks.rowGap,
  // Capped at the row: at 300px the xs minimum (280) is wider than the 276px row
  // and would scroll the page sideways.
  minWidth: `min(${footer.navigationMinWidth}, 100%)`,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const backToTop = style({
  display: 'flex',
  justifyContent: 'flex-end',
  flexGrow: 1,
  flexShrink: 0,
  // Below 768 Figma always gives this its own row, even where it would fit
  // beside the links; above it, it wraps naturally.
  flexBasis: '100%',
  '@media': {
    [`screen and (min-width: ${breakpoint.md.appWidth})`]: { flexBasis: 'auto' },
  },
});

export const topSection = style({
  // The wordmark box's 348px minimum is wider than the row at the narrowest widths.
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: footer.spacing,
  padding: `${footer.padding.verticalTop} ${footer.padding.horizontal}`,
  backgroundColor: footer.backgroundTop,
  color: contrast,
});

export const brandRow = style({
  ...row,
  alignItems: 'flex-end',
  columnGap: footer.columnGap,
  rowGap: footer.brandRowGap,
});

// Figma's wordmark width at each breakpoint falls out of this box's min/max and
// inset, not a per-breakpoint size (e.g. 224px at 768 but 320px at 480).
export const wordmarkBox = style({
  flex: '1 0 0',
  minWidth: footer.wordmark.boxMinWidth,
  maxWidth: footer.wordmark.boxMaxWidth,
  paddingInline: footer.wordmark.inset,
});

export const wordmark = style({
  display: 'block',
  width: '100%',
  maxWidth: footer.wordmark.maxWidth,
  height: 'auto',
});

export const socialLinks = style({
  flex: '1 0 0',
  minWidth: footer.socialLinksMinWidth,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: footer.socialLinksGap,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const columns = style({
  ...row,
  columnGap: footer.columnGap,
  rowGap: footer.spacing,
});

// A column's direct children are its items (Figma's `.Info column`).
export const column = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: footer.columnItemGap,
  flex: '1 1 0',
  // Capped at the row, same as legalLinks: below ~274px of available width the
  // uncapped minimum would be clipped by the top section's overflow:hidden.
  minWidth: `min(${footer.columnMinWidth}, 100%)`,
  // Figma's column text uses word-break: break-word so long unbreakable strings
  // (e.g. an email address) wrap instead of colliding with the next column.
  overflowWrap: 'anywhere',
});

// Typography and TextLink set their own dark colours, which a parent colour
// can't override by inheritance.
const invertible = [...Object.values(typographyClasses), ...Object.values(link)];
globalStyle(invertible.map((className) => `${column} .${className}`).join(', '), {
  color: `${contrast} !important`,
});
globalStyle(invertible.map((className) => `${column} .${className}:focus-visible`).join(', '), {
  outlineColor: `${focus.visibleInverted} !important`,
});
