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
    // input's font, so the input type scale has to be restated on it.
    '&::-webkit-datetime-edit': {
      fontSize: inputVars.font.text.fontSize,
      lineHeight: inputVars.font.text.lineHeight,
      color: text.primary,
    },
    // Unfilled segments render as `--`; match the placeholder colour
    // TextField.css.ts uses for `::placeholder`.
    '&::-webkit-datetime-edit-hour-field:not([aria-valuenow])': { color: text.secondary },
    '&::-webkit-datetime-edit-minute-field:not([aria-valuenow])': { color: text.secondary },
    '&::-webkit-datetime-edit-text': { color: text.secondary },
    '&:disabled::-webkit-datetime-edit': { color: text.disabled },
    '&:disabled::-webkit-datetime-edit-text': { color: text.disabled },
  },
});
