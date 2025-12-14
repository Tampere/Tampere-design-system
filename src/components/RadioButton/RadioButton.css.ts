import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  core,
  focusRing,
  colors,
  components: { typography, icon: iconVars, iconButton },
  text,
  spacing,
} = vars;

export const container = style({
  display: 'flex',
  alignItems: 'center',
  gap: spacing['2'],
});

export const iconWrapper = style({
  position: 'relative',
  width: iconVars.size.medium,
  height: iconVars.size.medium,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const inputBase = style({
  position: 'absolute',
  height: '100%',
  width: '100%',
  cursor: 'pointer',
  opacity: 0,
  margin: 0,
  top: 0,
  left: 0,
  zIndex: 1,
  selectors: {
    '&:disabled': {
      cursor: 'auto',
    },
  },
});

export const input = styleVariants({
  unchecked: [inputBase],
  checked: [inputBase],
  disabled: [inputBase],
  error: [inputBase],
});

export const icon = style({
  width: iconVars.size.medium,
  height: iconVars.size.medium,
  flexShrink: 0,
  position: 'absolute',
});

// Unchecked state
globalStyle(`${input.unchecked} + svg path`, {
  fill: iconButton.states.default,
});

globalStyle(`${input.unchecked}:hover + svg path`, {
  fill: core.selectionStates.unchecked.hover,
});

globalStyle(`${input.unchecked}:active + svg path`, {
  fill: core.selectionStates.unchecked.active,
});

globalStyle(`${input.unchecked}:focus-visible + svg path`, {
  fill: core.selectionStates.unchecked.focus,
});

// Checked state
globalStyle(`${input.checked} + svg path`, {
  fill: core.states.default,
});

globalStyle(`${input.checked}:hover + svg path`, {
  fill: core.states.hover,
});

globalStyle(`${input.checked}:active + svg path`, {
  fill: core.states.active,
});

// Disabled state
globalStyle(`${input.disabled} + svg path`, {
  fill: core.states.disabled,
});

// Error state
globalStyle(`${input.error} + svg path`, {
  fill: colors.red[400],
});

// Focus ring (shared)
globalStyle(`${inputBase}:focus-visible + svg`, {
  ...focusRing,
  borderRadius: '50%',
});

export const labelText = style({
  ...typography.p2,
  color: text.primary,
  cursor: 'pointer',
  selectors: {
    '&[data-disabled=true]': {
      color: text.disabled,
      cursor: 'default',
    },
  },
});
