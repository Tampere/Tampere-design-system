import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { typography },
    text,
  },
  primitives: { spacing },
} = vars;

export const padding = style({
  padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`,
});

export const modalHeaderTitle = style({
  margin: typography.margin,
  fontFamily: typography['h2'].fontFamily,
  fontSize: typography['h2'].fontSize,
  fontWeight: typography['h2'].fontWeight,
  lineHeight: typography['h2'].lineHeight,
  color: text.header,
});

export const modalCloseButton = style({
  alignSelf: 'flex-start',
});

export const header = style({
  padding: spacing[2],
  justifyContent: 'space-between',
});
