import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  core,
  components: { icon, iconButton },
  focusRing,
} = vars;

// Root style
const root = style({
  padding: iconButton.padding,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  aspectRatio: '1 / 1',
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
  height: icon.size.extraLarge,
});
globalStyle(`${root}[data-size="xl"] svg`, {
  width: icon.size.extraLarge,
  height: icon.size.extraLarge,
});

// Light theme states
const light = style({
  selectors: {
    '&:hover': {
      background: iconButton.states.contrast.overlay,
    },
    '&:focus-visible': {
      borderRadius: core.cornerRadius,
      ...focusRing,
    },
    '&:active': {
      background: iconButton.states.contrast.overlay,
    },
    '&:disabled': {
      cursor: 'default',
    },
  },
});

globalStyle(`${light}:hover svg path`, {
  fill: iconButton.states.contrast.hover,
});
globalStyle(`${light}:focus-visible svg path`, {
  fill: iconButton.states.contrast.focus,
});
globalStyle(`${light}:active svg path`, {
  fill: iconButton.states.contrast.active,
});
globalStyle(`${light}:disabled svg path`, {
  fill: iconButton.states.contrast.disabled,
});

// Dark theme states
const dark = style({
  selectors: {
    '&:hover': {
      background: iconButton.states.overlay,
    },
    '&:focus-visible': {
      borderRadius: core.cornerRadius,
      ...focusRing,
    },
    '&:active': {
      background: iconButton.states.overlay,
    },
    '&:disabled': {
      cursor: 'default',
    },
  },
});

globalStyle(`${dark}:hover svg path`, {
  fill: iconButton.states.hover,
});
globalStyle(`${dark}:focus-visible svg path`, {
  fill: iconButton.states.focus,
});
globalStyle(`${dark}:active svg path`, {
  fill: iconButton.states.active,
});
globalStyle(`${dark}:disabled svg path`, {
  fill: iconButton.states.disabled,
});

export const iconRoot = styleVariants({
  light: [root, light],
  dark: [root, dark],
});
