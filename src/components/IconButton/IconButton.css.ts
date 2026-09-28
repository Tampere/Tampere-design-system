import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { iconButtonForeground, iconButtonBackground } from './iconButtonState.css.ts';

const {
  theme: {
    cornerRadius: { sharp: cornerRadius },
    components: { icon, iconButton },
    focusRing,
    focusRingInverted,
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

function stateBlock(background: string, color: string, ring: typeof focusRing) {
  return style({
    color,
    selectors: {
      '&:hover': { background },
      '&:focus-visible': { background, borderRadius: cornerRadius, ...ring },
      '&:active': { background },
      '&:disabled': { background: 'none', cursor: 'default' },
    },
  });
}

// Both variants get an explicit rest-state colour: the icon's `fill="currentColor"`
// otherwise inherits whatever `color` the root resolves to, and a `component="a"`
// root with no author colour set falls back to the UA anchor-blue (or visited-purple)
// default instead of the design-system colour.
// `inverted` also needs the inverted focus ring — the default dark outline drops
// below WCAG 1.4.11/2.4.13's 3:1 contrast requirement against a coloured background.
const inverted = stateBlock(
  iconButtonBackground.inverted,
  iconButtonForeground.inverted.default,
  focusRingInverted
);
const defaultVariant = stateBlock(
  iconButtonBackground.default,
  iconButtonForeground.default.default,
  focusRing
);

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
