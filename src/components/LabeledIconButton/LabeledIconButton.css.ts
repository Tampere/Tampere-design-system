import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { iconButtonForeground } from '../IconButton/iconButtonState.css.ts';

const {
  theme: {
    cornerRadius,
    components: { icon, typography, labeledIconButton },
  },
} = vars;
const gap = labeledIconButton.spacing;

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap,
  padding: gap,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  borderRadius: cornerRadius,
  selectors: {
    '&:disabled': {
      cursor: 'default',
    },
  },
});

export const iconWrapper = style({});

globalStyle(`${iconWrapper} svg`, {
  width: icon.size.large,
  height: icon.size.large,
});

export const label = style({
  fontSize: typography.caption.fontSize,
  fontFamily: typography.caption.fontFamily,
  fontWeight: typography.caption.fontWeight,
  lineHeight: '100%',
});

const light = style({
  color: iconButtonForeground.light.default,
  selectors: {
    '&:disabled': { color: iconButtonForeground.light.disabled },
  },
});

const dark = style({
  color: iconButtonForeground.dark.default,
  selectors: {
    '&:disabled': { color: iconButtonForeground.dark.disabled },
  },
});

export const variants = styleVariants({ light: [light], dark: [dark] });
