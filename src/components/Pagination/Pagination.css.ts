import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    states,
    contrast,
    background: { disabled: backgroundDisabled },
    components: { pagination },
    focusRing,
  },
  primitives: { spacing },
} = vars;

export const list = style({
  display: 'flex',
  listStyleType: 'none',
  gap: spacing[1],
});

export const itemRoot = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: pagination.itemWidth,
  height: pagination.itemHeight,
};

const itemActive = {
  color: contrast,
  background: states.default,
  selectors: {
    '&:hover': {
      background: states.hover,
    },
    '&:focus-visible': {
      background: states.focus,
      ...focusRing,
    },
    '&:active': {
      background: states.active,
    },
    '&:disabled': {
      color: states.disabled,
      background: backgroundDisabled,
    },
  },
};

const item = {
  color: states.default,
  selectors: {
    '&:hover': {
      color: states.hover,
    },
    '&:focus-visible': {
      ...focusRing,
    },
    '&:active': {
      color: states.active,
    },
    '&:disabled': {
      color: states.disabled,
    },
  },
};

export const listItem = styleVariants({
  root: itemRoot,
  default: [itemRoot, item],
  active: [itemRoot, itemActive],
});

export const leftButton = style({
  width: pagination.itemWidth,
  height: pagination.itemHeight,
});

export const rightButton = style({
  width: pagination.itemWidth,
  height: pagination.itemHeight,
});
