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

export const typography = {
  xxl: {
    size: {
      h1: rem('40px'),
      h2: rem('36px'),
      h3: rem('32px'),
      h4: rem('28px'),
      h5: rem('24px'),
      subheader: rem('20px'),
      p1: rem('20px'),
      p2: rem('18px'),
      caption: rem('16px'),
    },
  },
  xl: {
    size: {
      h1: rem('40px'),
      h2: rem('36px'),
      h3: rem('32px'),
      h4: rem('28px'),
      h5: rem('24px'),
      subheader: rem('20px'),
      p1: rem('20px'),
      p2: rem('18px'),
      caption: rem('16px'),
    },
  },
  lg: {
    size: {
      h1: rem('36px'),
      h2: rem('32px'),
      h3: rem('28px'),
      h4: rem('24px'),
      h5: rem('22px'),
      subheader: rem('20px'),
      p1: rem('20px'),
      p2: rem('18px'),
      caption: rem('16px'),
    },
  },
  md: {
    size: {
      h1: rem('32px'),
      h2: rem('28px'),
      h3: rem('24px'),
      h4: rem('20px'),
      h5: rem('18px'),
      subheader: rem('18px'),
      p1: rem('18px'),
      p2: rem('16px'),
      caption: rem('14px'),
    },
  },
  sm: {
    size: {
      h1: rem('28px'),
      h2: rem('24px'),
      h3: rem('20px'),
      h4: rem('18px'),
      h5: rem('16px'),
      subheader: rem('16px'),
      p1: rem('16px'),
      p2: rem('14px'),
      caption: rem('12px'),
    },
  },
  xs: {
    size: {
      h1: rem('28px'),
      h2: rem('24px'),
      h3: rem('20px'),
      h4: rem('18px'),
      h5: rem('16px'),
      subheader: rem('16px'),
      p1: rem('16px'),
      p2: rem('14px'),
      caption: rem('12px'),
    },
  },
};
