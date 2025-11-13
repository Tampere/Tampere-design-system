import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  components: { typography },
} = vars;

export const padding = style({
  padding: `0 ${vars.spacing[2]} ${vars.spacing[2]} ${vars.spacing[2]}`,
});

export const modalHeaderTitle = style({
  margin: vars.components.typography.margin,
  fontFamily: typography['h2'].fontFamily,
  fontSize: typography['h2'].fontSize,
  fontWeight: typography['h2'].fontWeight,
  lineHeight: typography['h2'].lineHeight,
  color: vars.text.header,
});

export const modalCloseButton = style({
  alignSelf: 'flex-start',
});

export const header = style({
  padding: vars.spacing[2],
  justifyContent: 'space-between',
});
