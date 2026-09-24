import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { breakpoint } from '../../theme/tokens/breakpoint';

const {
  theme: {
    contrast,
    components: { footer, typography },
  },
} = vars;

const row = {
  position: 'relative',
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
