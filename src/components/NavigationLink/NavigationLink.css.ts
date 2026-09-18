import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: { components, strokeWeight, states, contrast, focusRing, focusRingInverted, text },
} = vars;
const { navigationLink } = components;

const linkBase = {
  textDecoration: 'none',
  borderBottom: `solid ${strokeWeight} transparent`,
  width: 'fit-content',
};

const linkSmall = {
  ...linkBase,
  ...components.typography['p2'],
  color: text.secondary,
};

const linkMedium = {
  ...linkBase,
  ...components.typography['p1'],
  fontWeight: navigationLink.label.mediumFontWeight,
  color: text.primary,
};

const defaultSelectors = {
  '&:focus-visible': focusRing,
  '&:hover': {
    borderBottom: `solid ${strokeWeight} ${states.hover}`,
  },
};

const invertedSelectors = {
  '&:focus-visible': focusRingInverted,
  '&:hover': {
    borderBottom: `solid ${strokeWeight} ${contrast}`,
  },
};

const variants = {
  default: { selectors: defaultSelectors },
  inverted: { color: contrast, selectors: invertedSelectors },
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
    borderBottom: `solid ${strokeWeight} ${states.hover}`,
  },
  inverted: {
    borderBottom: `solid ${strokeWeight} ${contrast}`,
  },
});

// Applied only when startIcon/endIcon is given (see NavigationLink.tsx) —
// the plain text-only link keeps its default inline layout untouched.
export const withIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: navigationLink.icon.spacing,
});

export const iconWrapper = style({
  flexShrink: 0,
  width: navigationLink.icon.size,
  height: navigationLink.icon.size,
  // Same offset/technique as TextLink.css.ts's `externalIcon` — nudges the
  // icon up to visually balance it against the link's underline.
  position: 'relative',
  top: navigationLink.icon.verticalOffset,
});

// Icons are authored at their own intrinsic viewBox size (e.g. 24×24) —
// same fixed-size-container approach as LabeledIconButton.css.ts's
// `iconWrapper svg` rule, so any icon fills this 18px box regardless of the
// SVG's own width/height attributes.
globalStyle(`${iconWrapper} svg`, {
  width: '100%',
  height: '100%',
});
