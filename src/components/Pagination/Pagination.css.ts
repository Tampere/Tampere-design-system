import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@theme';

const {
  core,
  spacing,
  components: { pagination },
  focusRing,
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
  color: core.contrast,
  background: core.states.default,
  selectors: {
    '&:hover': {
      background: core.states.hover,
    },
    '&:focus-visible': {
      background: core.states.focus,
      ...focusRing,
    },
    '&:active': {
      background: core.states.active,
    },
    '&:disabled': {
      color: core.states.disabled,
      background: core.backgroundDisabled,
    },
  },
};

const item = {
  color: core.states.default,
  selectors: {
    '&:hover': {
      color: core.states.hover,
    },
    '&:focus-visible': {
      ...focusRing,
    },
    '&:active': {
      color: core.states.active,
    },
    '&:disabled': {
      color: core.states.disabled,
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
  transform: 'rotate(180deg)',
});
