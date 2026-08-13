import { styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: { components, strokeWeight, states, contrast, focusRing, focusRingInverted, text },
} = vars;

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
