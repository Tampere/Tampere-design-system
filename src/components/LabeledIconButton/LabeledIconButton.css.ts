import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { iconButtonForeground, iconButtonBackground } from '../IconButton/iconButtonState.css.ts';

const {
  theme: {
    cornerRadius,
    components: { icon, typography, labeledIconButton },
    focusRing,
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

function variantStyle(foreground: (typeof iconButtonForeground)['light'], background: string) {
  return style({
    color: foreground.default,
    selectors: {
      '&:hover': { background, color: foreground.hover },
      '&:focus-visible': { background, color: foreground.focus, ...focusRing },
      '&:active': { background, color: foreground.active },
      '&:disabled': { color: foreground.disabled },
    },
  });
}

export const variants = styleVariants({
  light: [variantStyle(iconButtonForeground.light, iconButtonBackground.light)],
  dark: [variantStyle(iconButtonForeground.dark, iconButtonBackground.dark)],
});
