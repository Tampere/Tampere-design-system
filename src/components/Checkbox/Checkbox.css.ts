import { rem } from '@mantine/core';
import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const { spacing, focusRing } = vars;

export const root = style({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  gap: spacing[2],
});

export const inner = style({
  position: 'relative',
  width: rem(24),
  height: rem(24),
});

export const input = style({
  appearance: 'none',
  width: rem(24),
  height: rem(24),
  margin: 0,
  selectors: {
    '&:focus-visible': {
      ...focusRing,
    },
  },
});

export const icon = style({
  position: 'absolute',
  pointerEvents: 'none',
  inset: 0,
});

export const inputLabel = style({
  appearance: 'none',
  height: rem(24),
  gap: spacing['0,5'],
});
