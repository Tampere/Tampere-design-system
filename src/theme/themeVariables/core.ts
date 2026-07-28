import { rem } from '@mantine/core';
import { colors } from './colors';

export const core = {
  background: colors.neutral.white,
  backgroundDisabled: colors.neutral['100'],
  contrast: colors.neutral.white,
  error: colors.red['300'],
  mainLight: colors.blue['300'],
  main: colors.blue['400'],
  mainDark: colors.blue['500'],
  mainDarker: colors.blue['600'],
  focus: {
    visible: colors.neutral['900'],
    visibleInverted: colors.neutral.white,
  },
  mainExtraDark: colors.blue['700'],
  hover: {
    overlay: 'rgba(0, 0, 0, 0.0300)',
    overlayContrast: 'rgba(255, 255, 255, 0.0500)',
  },
  divider: colors.neutral['200'],
  cornerRadius: rem(0),
  strokeWeight: rem('2px'),
  dropShadow: colors.neutral['400'],
  states: {
    default: colors.blue['400'],
    hover: colors.blue['600'],
    focus: colors.blue['400'],
    active: colors.blue['300'],
    disabled: colors.neutral['300'],
    error: colors.red['300'],
    visited: colors.blue['300'],
  },
  selectionStates: {
    unchecked: {
      hover: colors.neutral['500'],
      focus: colors.neutral['500'],
      active: colors.neutral['400'],
    },
  },
} as const;
