import { rem } from '@mantine/core';
import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  primitives: { spacing },
  theme: {
    focusRing,
    states,
    selectionStates,
    components: { iconButton, typography },
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
    ...typography.p2,
    color: text.primary,
    appearance: 'none',
    height: rem(24),
    gap: spacing['0,5'],
  },
  disabled: {
    ...typography.p2,
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

// `:focus-visible` and `:active` tie in specificity — (0,2,2) each — so source order decides
// which wins while a focused control is being pressed. `:active` is declared last deliberately:
// pressing is a momentary state and should read as pressed, not merely focused. RadioButton.css.ts
// declares the same block in the same order; keep the two in step.
globalStyle(`${input}:focus-visible + svg path`, {
  fill: selectionStates.unchecked.focus,
});

globalStyle(`${input}:active + svg path`, {
  fill: selectionStates.unchecked.active,
});

// Checked & indeterminate states (identical colors per Figma design). `:is(...)` keeps future
// checked-state rules from having to remember to also list `[data-indeterminate=true]`.
const checkedOrIndeterminate = `${input}:is([data-checked=true], [data-indeterminate=true])`;

globalStyle(`${checkedOrIndeterminate} + svg path`, {
  fill: states.default,
});

globalStyle(`${checkedOrIndeterminate}:hover + svg path`, {
  fill: states.hover,
});

// Keep this rule. `states.focus` currently equals `states.default`, so it looks inert — but it is
// what lets the two ever diverge and still take effect for a checked/indeterminate checkbox.
// It also ties at (0,3,2) with the `:hover` rule above and wins by source order, so a focused
// checkbox stays `states.focus` when hovered rather than darkening to `states.hover`. That is
// deliberate, and matches the unchecked block, which orders `:hover` before `:focus-visible` too.
// RadioButton.css.ts declares the mirror of this rule; keep the two in step. Because the two
// tokens are equal today, no story can observe whether this rule is present — that pairing is the
// only thing keeping it honest, so don't delete it from one file alone.
globalStyle(`${checkedOrIndeterminate}:focus-visible + svg path`, {
  fill: states.focus,
});

globalStyle(`${checkedOrIndeterminate}:active + svg path`, {
  fill: states.active,
});

// Disabled state
globalStyle(`${input}[data-disabled=true] + svg path`, {
  fill: states.disabled,
});

// Error state
globalStyle(`${input}[data-error=true] + svg path`, {
  fill: states.error,
});
