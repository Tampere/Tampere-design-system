import { rem } from '@mantine/core';
import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  spacing,
  focusRing,
  core,
  colors,
  components: { iconButton },
  text,
} = vars;

export const root = style({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  gap: spacing[2],
});

export const inner = style({
  position: 'relative',
  width: rem(24),
  height: rem(24),
});

export const inputBase = style({
  cursor: 'pointer',
  appearance: 'none',
  width: rem(24),
  height: rem(24),
  margin: 0,
  selectors: {
    '&:focus-visible': {
      ...focusRing,
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
  position: 'absolute',
  pointerEvents: 'none',
  inset: 0,
});

export const inputLabel = styleVariants({
  default: {
    appearance: 'none',
    height: rem(24),
    gap: spacing['0,5'],
  },
  disabled: {
    appearance: 'none',
    height: rem(24),
    gap: spacing['0,5'],
    color: text.disabled,
  },
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
