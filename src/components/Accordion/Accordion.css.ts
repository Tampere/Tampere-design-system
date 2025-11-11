import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "@theme";

const {
  core,
  spacing,
  components: {
    accordion: accordionVars,
    typography,
    item: itemVars,
    iconButton,
  },
  focusRing,
} = vars;

const accordionRoot = style({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  position: "relative", // Needed for html body overflowing bug on webkit browsers
});

globalStyle(`${accordionRoot} button[data-disabled="true"] svg path`, {
  fill: iconButton.states.disabled,
});

export const accordion = styleVariants({
  default: [accordionRoot, { gap: accordionVars.spacing }],
  none: [accordionRoot, { gap: 0 }],
});

export const control = style({
  ...typography.p1,
  flex: 1,
  cursor: "pointer",
  display: "flex",
  flexDirection: "row-reverse",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${accordionVars.padding.vertical} ${accordionVars.padding.horizontal}`,
  background: itemVars.background.default,
  border: "none",
  selectors: {
    "&[data-active=true]": {
      borderBottom: `${core.strokeWeight} solid ${core.divider}`,
    },
    "&:hover": {
      background: itemVars.background.hover,
    },
    "&:focus-visible": {
      ...focusRing,
      background: itemVars.background.hover,
    },
    "&:disabled": {
      background: itemVars.background.disabled,
    },
  },
});

export const label = style({
  flex: 1,
  display: "flex",
  justifyContent: "space-between",
  paddingRight: spacing[1],
  minWidth: 0,
});

export const chevron = style({
  display: "flex",
  alignItems: "center",
  transition: "rotate 0.2s ease",
  selectors: {
    "&[data-rotate=true]": {
      rotate: "180deg",
    },
  },
});

export const item = style({
  display: "flex",
  flexDirection: "column",
  boxShadow: `0px 1px 4px 0px ${core.dropshadow}`, // TODO: Use theme variable
});

export const content = style({
  display: "flex",
  padding: `${accordionVars.padding.vertical} ${accordionVars.padding.horizontal}`,
  flexDirection: "column",
  alignItems: "flex-start",
  alignSelf: "stretch",
  position: "relative", // Needed for html body overflowing bug on webkit browsers
});
