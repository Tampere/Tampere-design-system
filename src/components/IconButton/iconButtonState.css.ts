import { vars } from '../../theme';

const {
  theme: {
    components: { iconButton },
  },
} = vars;

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
