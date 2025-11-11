import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "@theme";

const {
  colors,
  components: { typography, switch: switchComponent },
  focusRing,
} = vars;

export const body = style({
  alignItems: "center",
});

export const input = style({
  selectors: {
    "&:focus-visible": {
      ...focusRing,
    },
  },
});

export const track = style({
  cursor: "pointer",
  height: switchComponent.height,
  borderRadius: 0,
  width: `calc(${switchComponent.height} * 2)`,
  vars: {
    "--switch-color": vars.core.states.default,
    "--switch-bg": switchComponent.backgroundUnchecked,
  },
  selectors: {
    "&:hover": {
      vars: {
        "--switch-color": vars.core.states.hover,
      },
    },
  },
});

export const thumb = style({
  height: switchComponent.height,
  width: switchComponent.height,
  borderRadius: 0,
  right: 0,
  border: 0,
  vars: {
    "--switch-thumb-size": switchComponent.height,
    "--switch-track-label-padding": "0px",
  },
});

export const label = style({
  margin: vars.components.typography.margin,
  fontSize: typography.p1.fontSize,
  fontWeight: typography.p1.fontWeight,
  lineHeight: typography.p1.lineHeight,
});

export const closeIcon = style({});

globalStyle(`${closeIcon}:hover path`, {
  fill: colors.neutral[500],
});

export const openIcon = style({});

globalStyle(`${openIcon}:hover path`, {
  fill: vars.core.states.hover,
});
