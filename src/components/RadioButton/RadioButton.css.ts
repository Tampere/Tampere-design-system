import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    states,
    selectionStates,
    focusRing,
    components: { typography, icon: iconVars, iconButton },
    text,
  },
  primitives: { spacing },
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

export const input = style({
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

export const icon = style({
  width: iconVars.size.medium,
  height: iconVars.size.medium,
  flexShrink: 0,
  position: 'absolute',
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
// pressing is a momentary state and should read as pressed, not merely focused. Checkbox.css.ts
// declares the same block in the same order; keep the two in step.
globalStyle(`${input}:focus-visible + svg path`, {
  fill: selectionStates.unchecked.focus,
});

globalStyle(`${input}:active + svg path`, {
  fill: selectionStates.unchecked.active,
});

// Checked state
globalStyle(`${input}[data-checked=true] + svg path`, {
  fill: states.default,
});

globalStyle(`${input}[data-checked=true]:hover + svg path`, {
  fill: states.hover,
});

// Keep this rule. `states.focus` currently equals `states.default`, so it looks inert — but it is
// what lets the two ever diverge and still take effect for a checked radio. It also ties at
// (0,3,2) with the `:hover` rule above and wins by source order, so a focused radio stays
// `states.focus` when hovered rather than darkening to `states.hover`. That is deliberate, and
// matches both the unchecked block above and Checkbox.css.ts's checked block. Because the two
// tokens are equal today, no story can observe whether this rule is present — the pair of files
// is the only thing keeping it honest, so don't delete it from one of them alone.
globalStyle(`${input}[data-checked=true]:focus-visible + svg path`, {
  fill: states.focus,
});

globalStyle(`${input}[data-checked=true]:active + svg path`, {
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

// Focus ring (shared)
globalStyle(`${input}:focus-visible + svg`, {
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
