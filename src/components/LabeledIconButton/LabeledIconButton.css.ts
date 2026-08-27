import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { iconButtonForeground, iconButtonBackground } from '../IconButton/iconButtonState.css.ts';

const {
  theme: {
    cornerRadius: { sharp: cornerRadius },
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

// Mirrors the `<Flex direction="column" align="center">` this wrapper used
// to render — a plain <span> is used instead (not Mantine's <Flex>, which
// defaults to a <div>) because a <div> is invalid inside <button> phrasing
// content (see Button.tsx's <Flex component="span"> for the same reason).
export const iconWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

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

function variantStyle(foreground: (typeof iconButtonForeground)['default'], background: string) {
  return style({
    color: foreground.default,
    selectors: {
      '&:hover': { background, color: foreground.hover },
      '&:focus-visible': { background, color: foreground.focus, ...focusRing },
      '&:active': { background, color: foreground.active },
      '&:disabled': { background: 'none', color: foreground.disabled },
    },
  });
}

export const variants = styleVariants({
  inverted: [variantStyle(iconButtonForeground.inverted, iconButtonBackground.inverted)],
  default: [variantStyle(iconButtonForeground.default, iconButtonBackground.default)],
});
