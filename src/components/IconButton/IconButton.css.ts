import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { iconButtonForeground, iconButtonBackground } from './iconButtonState.css.ts';

const {
  theme: {
    cornerRadius: { sharp: cornerRadius },
    components: { icon, iconButton },
    focusRing,
  },
} = vars;

// Root style
const root = style({
  padding: iconButton.padding,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  aspectRatio: '1 / 1',
  minWidth: iconButton.minTouchTarget,
  minHeight: iconButton.minTouchTarget,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
});

// Icon wrapper
export const iconWrapper = style({
  display: 'flex',
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
});

globalStyle(`${root}[data-size="xs"] svg`, {
  width: icon.size.extraSmall,
  height: icon.size.extraSmall,
});
globalStyle(`${root}[data-size="sm"] svg`, {
  width: icon.size.small,
  height: icon.size.small,
});
globalStyle(`${root}[data-size="md"] svg`, {
  width: icon.size.medium,
  height: icon.size.medium,
});
globalStyle(`${root}[data-size="lg"] svg`, {
  width: icon.size.large,
  height: icon.size.large,
});
globalStyle(`${root}[data-size="xl"] svg`, {
  width: icon.size.extraLarge,
  height: icon.size.extraLarge,
});

function stateBlock(background: string) {
  return style({
    selectors: {
      '&:hover': { background },
      '&:focus-visible': { background, borderRadius: cornerRadius, ...focusRing },
      '&:active': { background },
      '&:disabled': { background: 'none', cursor: 'default' },
    },
  });
}

const inverted = stateBlock(iconButtonBackground.inverted);
const defaultVariant = stateBlock(iconButtonBackground.default);

globalStyle(`${inverted}:hover svg path`, { fill: iconButtonForeground.inverted.hover });
globalStyle(`${inverted}:focus-visible svg path`, { fill: iconButtonForeground.inverted.focus });
globalStyle(`${inverted}:active svg path`, { fill: iconButtonForeground.inverted.active });
globalStyle(`${inverted}:disabled svg path`, { fill: iconButtonForeground.inverted.disabled });

globalStyle(`${defaultVariant}:hover svg path`, { fill: iconButtonForeground.default.hover });
globalStyle(`${defaultVariant}:focus-visible svg path`, {
  fill: iconButtonForeground.default.focus,
});
globalStyle(`${defaultVariant}:active svg path`, { fill: iconButtonForeground.default.active });
globalStyle(`${defaultVariant}:disabled svg path`, {
  fill: iconButtonForeground.default.disabled,
});

export const iconRoot = styleVariants({
  default: [root, defaultVariant],
  inverted: [root, inverted],
});
