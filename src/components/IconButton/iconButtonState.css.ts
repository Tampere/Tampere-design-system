import { vars } from '../../theme';

const {
  theme: {
    components: { iconButton },
  },
} = vars;

// The `variant` prop name ("light"/"dark") intentionally does not match the
// token sub-object name it maps to below — this is describing the icon's
// own rendered color, not the token collection's naming:
//   - variant="light": the icon renders light/white-ish, for placement on a
//     colored or dark surface — maps to the `contrast.*` token sub-object.
//   - variant="dark": the icon renders dark-gray, for placement on a plain
//     light surface — maps to the plain (non-`contrast`) tokens.
// A future third variant should preserve this "light variant -> contrast
// tokens" pairing rather than assuming the names line up directly.
export const iconButtonForeground = {
  light: {
    default: iconButton.states.contrast.default,
    hover: iconButton.states.contrast.hover,
    focus: iconButton.states.contrast.focus,
    active: iconButton.states.contrast.active,
    disabled: iconButton.states.contrast.disabled,
  },
  dark: {
    default: iconButton.states.default,
    hover: iconButton.states.hover,
    focus: iconButton.states.focus,
    active: iconButton.states.active,
    disabled: iconButton.states.disabled,
  },
} as const;

export const iconButtonBackground = {
  light: iconButton.states.contrast.overlay,
  dark: iconButton.states.overlay,
} as const;
