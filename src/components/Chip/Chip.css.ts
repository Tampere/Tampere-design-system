import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: { components, states, inputStates, text, focusRing, strokeWeight },
} = vars;

const labelFont = {
  fontFamily: components.chip.label.fontFamily,
  fontWeight: components.chip.label.fontWeight,
  lineHeight: components.chip.label.lineHeight,
};

// Mantine's Chip sets total height via `--chip-size` directly (no vertical
// padding of its own) and font-size via `--chip-fz` — these two, plus
// `--chip-radius`/`--chip-padding`/`--chip-spacing`, apply unconditionally on
// the base label rule. `--chip-bd`/`--chip-bg`/`--chip-color` do NOT — Mantine
// only reads those under an explicit `variant` (outline/filled), which we
// don't use, so border/background/text color are set directly below via
// `filterLabel`'s own `data-checked`/`data-disabled` selectors instead.
export const filterRoot = style({
  vars: {
    '--chip-size': components.chip.height,
    '--chip-fz': components.chip.label.fontSize,
    '--chip-radius': components.chip.cornerRadius,
    '--chip-padding': components.chip.padding.horizontal,
    '--chip-spacing': components.chip.spacing,
  },
});

export const filterInput = style({});

export const filterLabel = style({
  ...labelFont,
  selectors: {
    // Both attribute selectors below add a class + attribute (0,2,0), which
    // beats Mantine's own plain `.label` base rule (0,1,0) regardless of
    // stylesheet order — Mantine wraps its own attribute selectors in
    // `:where()` specifically so consumer overrides like this always win.
    '&:not([data-checked])': {
      border: `${strokeWeight} solid ${inputStates.default}`,
      backgroundColor: 'transparent',
      color: text.primary,
    },
    '&[data-checked]': {
      border: `${strokeWeight} solid ${states.default}`,
      backgroundColor: components.item.background.selected.default,
      color: text.primary,
    },
    '&[data-disabled]': {
      border: `${strokeWeight} solid ${states.disabled}`,
      color: text.disabled,
    },
    [`${filterInput}:focus-visible + &`]: { ...focusRing },
  },
});

export const tagRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: components.chip.height,
  borderRadius: components.chip.cornerRadius,
  paddingInline: components.chip.padding.horizontal,
  gap: components.chip.spacing,
  backgroundColor: components.chip.tagFill,
  color: text.primary,
  ...labelFont,
  fontSize: components.chip.label.fontSize,
  selectors: {
    '&[data-disabled]': { color: text.disabled },
  },
});

export const tagDismissIcon = style({
  color: text.secondary,
});
