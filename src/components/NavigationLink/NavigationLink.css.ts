import { styleVariants } from "@vanilla-extract/css";
import { vars } from "@theme";

const { components, core, focusRing, focusRingInverted, text } = vars;

const linkBase = {
  textDecoration: "none",
  borderBottom: `solid ${core.strokeWeight} transparent`,
  width: "fit-content",
};

const linkSmall = {
  ...linkBase,
  ...components.typography["p2"],
  color: text.secondary,
};

const linkMedium = {
  ...linkBase,
  ...components.typography["p1"],
  color: text.primary,
};

const defaultSelectors = {
  "&:focus-visible": focusRing,
  "&:hover": {
    borderBottom: `solid ${core.strokeWeight} ${core.states.hover}`,
  },
};

const invertedSelectors = {
  "&:focus-visible": focusRingInverted,
  "&:hover": {
    borderBottom: `solid ${core.strokeWeight} ${core.contrast}`,
  },
};

const variants = {
  default: { selectors: defaultSelectors },
  inverted: { color: core.contrast, selectors: invertedSelectors },
};

export const linkSize = styleVariants({
  sm: linkSmall,
  md: linkMedium,
});

export const linkVariant = styleVariants({
  default: variants.default,
  inverted: variants.inverted,
});

export const selected = styleVariants({
  default: {
    borderBottom: `solid ${core.strokeWeight} ${core.states.hover}`,
  },
  inverted: {
    borderBottom: `solid ${core.strokeWeight} ${core.contrast}`,
  },
});
