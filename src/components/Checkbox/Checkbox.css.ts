import { rem } from '@mantine/core';
import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  primitives: { spacing },
  theme: {
    focusRing,
    states,
    selectionStates,
    components: { iconButton },
    text,
  },
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

export const input = style({
  cursor: 'pointer',
  appearance: 'none',
  width: rem(24),
  height: rem(24),
  margin: 0,
  selectors: {
    '&:focus-visible': {
      ...focusRing,
    },
    '&:disabled': {
      cursor: 'default',
    },
  },
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
    cursor: 'default',
  },
});

// Unchecked state
globalStyle(`${input} + svg path`, {
  fill: iconButton.states.default,
});

globalStyle(`${input}:hover + svg path`, {
  fill: selectionStates.unchecked.hover,
});

globalStyle(`${input}:active + svg path`, {
  fill: selectionStates.unchecked.active,
});

globalStyle(`${input}:focus-visible + svg path`, {
  fill: selectionStates.unchecked.focus,
});

// Checked & indeterminate states (identical colors per Figma design)
globalStyle(
  `${input}[data-checked=true] + svg path, ${input}[data-indeterminate=true] + svg path`,
  {
    fill: states.default,
  }
);

globalStyle(
  `${input}[data-checked=true]:hover + svg path, ${input}[data-indeterminate=true]:hover + svg path`,
  {
    fill: states.hover,
  }
);

globalStyle(
  `${input}[data-checked=true]:active + svg path, ${input}[data-indeterminate=true]:active + svg path`,
  {
    fill: states.active,
  }
);

// Disabled state
globalStyle(`${input}[data-disabled=true] + svg path`, {
  fill: states.disabled,
});

// Error state
globalStyle(`${input}[data-error=true] + svg path`, {
  fill: states.error,
});
