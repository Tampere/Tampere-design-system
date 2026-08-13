import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  primitives: { spacing },
  theme: {
    components: { typography, item },
    strokeWeight,
    states,
    divider,
  },
} = vars;

const cellPadding = `${spacing['1,5']} ${spacing[2]}`;

export const root = style({
  borderCollapse: 'collapse',
});

export const tableCell = style({
  ...typography.p1,
  padding: cellPadding,
});

export const headerCell = styleVariants({
  col: {
    ...typography.subheader,
    textAlign: 'left',
    padding: cellPadding,
  },
  row: {
    ...typography.subheader,
    padding: cellPadding,
    textAlign: 'left',
    borderRight: `${strokeWeight} solid ${states.default}`,
  },
});

export const caption = style({
  ...typography.h5,
  textAlign: 'left',
  padding: cellPadding,
});

export const tableRow = style({
  borderBottom: `${strokeWeight} solid ${divider}`,
  selectors: {
    '&:last-child': {
      borderBottom: `${strokeWeight} solid ${states.default}`,
    },
    '&:hover': {
      backgroundColor: item.background.hover,
    },
  },
});

globalStyle(`${tableRow}.selected`, {
  backgroundColor: item.background.selected.default,
});

globalStyle(`${tableRow}.selected:hover`, {
  backgroundColor: item.background.selected.hover,
});

export const footer = style({
  padding: ` ${spacing[2]} 0`,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
});
