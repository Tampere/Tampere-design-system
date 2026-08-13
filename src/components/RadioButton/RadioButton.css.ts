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

globalStyle(`${input}:active + svg path`, {
  fill: selectionStates.unchecked.active,
});

globalStyle(`${input}:focus-visible + svg path`, {
  fill: selectionStates.unchecked.focus,
});

// Checked state
globalStyle(`${input}[data-checked=true] + svg path`, {
  fill: states.default,
});

globalStyle(`${input}[data-checked=true]:hover + svg path`, {
  fill: states.hover,
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
