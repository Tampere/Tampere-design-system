import { vars } from '../../theme';

const {
  theme: {
    components: { iconButton },
  },
} = vars;

// The `variant` prop name ("default"/"inverted") does not match the token
// sub-object name it maps to below — this is describing the icon's own
// rendered color, not the token collection's naming:
//   - variant="inverted": the icon renders light/white-ish, for placement on
//     a colored or dark surface — maps to the `contrast.*` token sub-object.
//   - variant="default": the icon renders dark-gray, for placement on a
//     plain light surface — maps to the plain (non-`contrast`) tokens.
// A future third variant should preserve this "inverted variant -> contrast
// tokens" pairing rather than assuming the names line up directly.
export const iconButtonForeground = {
  inverted: {
    default: iconButton.states.contrast.default,
    hover: iconButton.states.contrast.hover,
    focus: iconButton.states.contrast.focus,
    active: iconButton.states.contrast.active,
    disabled: iconButton.states.contrast.disabled,
  },
  default: {
    default: iconButton.states.default,
    hover: iconButton.states.hover,
    focus: iconButton.states.focus,
    active: iconButton.states.active,
    disabled: iconButton.states.disabled,
  },
} as const;

export const iconButtonBackground = {
  inverted: iconButton.states.contrast.overlay,
  default: iconButton.states.overlay,
} as const;
