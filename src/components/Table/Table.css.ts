import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  spacing,
  components: { typography, item },
  core,
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
    borderRight: `${core.strokeWeight} solid ${core.states.default}`,
  },
});

export const caption = style({
  ...typography.h5,
  textAlign: 'left',
  padding: cellPadding,
});

export const tableRow = style({
  borderBottom: `${core.strokeWeight} solid ${core.divider}`,
  selectors: {
    '&:last-child': {
      borderBottom: `${core.strokeWeight} solid ${core.states.default}`,
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
