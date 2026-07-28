import { rem } from '@mantine/core';
import { colors } from './colors';

export const font = {
  letterSpacing: rem(0),
} as const;

export const text = {
  primary: colors.neutral[800],
  secondary: colors.neutral[600],
  disabled: colors.neutral[500],
  header: colors.neutral[900],
  primaryHeader: colors.blue[500],
} as const;

export const highlight = {
  fontWeight: '700',
  backgroundColor: 'transparent',
};
