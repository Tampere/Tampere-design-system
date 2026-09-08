import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    text,
    components: { input: inputVars, button: buttonVars },
  },
} = vars;

// The trigger icon scales with the responsive control size, exactly as
// DateField's calendar icon does (Figma Components/Button/Icon/Size).
export const triggerIcon = style({
  width: buttonVars.lineHeight,
  height: 'auto',
});

export const timeInput = style({
  selectors: {
    // Figma places the clock control outside the field as a separate Button, so
    // the browser's in-field indicator (and any native clear affordance beside
    // it) must be suppressed — otherwise the field shows two clock icons and
    // two ✕ controls.
    '&::-webkit-calendar-picker-indicator': { display: 'none' },
    '&::-webkit-clear-button': { display: 'none' },
    '&::-webkit-inner-spin-button': { display: 'none' },
    // The segment editor is a shadow-DOM widget that does not inherit the
    // input's font, so the input type scale has to be restated on it. Filled
    // segments (and the `:` separator between them) inherit this text.primary
    // colour from here — there is no separate rule for them below.
    '&::-webkit-datetime-edit': {
      fontSize: inputVars.font.text.fontSize,
      lineHeight: inputVars.font.text.lineHeight,
      color: text.primary,
    },
    // When every segment is still unfilled (`--:--`), colour the whole edit
    // region — segments and the `:` separator alike — in the placeholder
    // colour TextField.css.ts uses for `::placeholder`. `data-empty` is set by
    // TimeField.tsx from component state: Chromium's `-webkit-datetime-edit-*`
    // pseudo-elements are UA-shadow constructs that do not support
    // `:not([attr])` matching (confirmed empirically — a prior version of
    // this rule used `:not([aria-valuenow])` and never matched, filled or
    // not), so the browser's own per-segment fill state can't be selected
    // from CSS directly.
    '&[data-empty="true"]::-webkit-datetime-edit': { color: text.secondary },
    '&:disabled::-webkit-datetime-edit': { color: text.disabled },
  },
});
