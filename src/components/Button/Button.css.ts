import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "@theme";

const {
  components: { button },
  font,
  core,
  spacing,
  focusRing,
} = vars;

const root = style({
  width: "fit-content",
  fontSize: button.fontSize,
  lineHeight: button.lineHeight,
  letterSpacing: font.letterSpacing,
  padding: `${button.padding.vertical} ${button.padding.horizontal}`,
});

const filled = style({
  background: core.states.default,
  color: core.contrast,
  selectors: {
    "&:hover": {
      background: core.states.hover,
    },
    "&:focus-visible": {
      background: core.states.focus,
      ...focusRing,
    },
    "&:active": {
      background: core.states.active,
    },
    "&:disabled": {
      color: core.states.disabled,
      background: core.backgroundDisabled,
    },
  },
});

const outlined = style({
  color: core.states.default,
  border: `${core.strokeWeight} solid ${core.states.default}`,
  selectors: {
    "&:hover": {
      border: `${core.strokeWeight} solid ${core.states.hover}`,
    },
    "&:focus-visible": {
      ...focusRing,
    },
    "&:active": {
      color: core.states.active,
      border: `${core.strokeWeight} solid ${core.states.active}`,
    },
    "&:disabled": {
      color: core.states.disabled,
      border: `${core.strokeWeight} solid ${core.states.disabled}`,
    },
  },
});

const text = style({
  color: core.states.default,
  borderBottom: `${core.strokeWeight} solid transparent`,
  selectors: {
    "&:hover": {
      borderBottom: `${core.strokeWeight} solid ${core.states.hover}`,
    },
    "&:focus-visible": {
      borderBottom: `${core.strokeWeight} solid ${core.states.hover}`,
      ...focusRing,
    },
    "&:active": {
      borderBottom: `${core.strokeWeight} solid ${core.states.active}`,
      color: core.states.active,
    },
    "&:disabled": {
      color: core.states.disabled,
    },
  },
});

export const variants = styleVariants({
  filled: [root, filled],
  outlined: [root, outlined],
  text: [root, text],
});

export const content = style({
  alignItems: "center",
  gap: spacing["1,5"],
});
