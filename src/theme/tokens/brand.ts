import { primitives } from './primitives';

const blue = {
  mainLight: primitives.colors.blue['300'],
  main: primitives.colors.blue['400'],
  mainDark: primitives.colors.blue['500'],
  mainDarker: primitives.colors.blue['600'],
  mainExtraDark: primitives.colors.blue['700'],
} as const;

export const brand = { blue } as const;
export type Brand = typeof brand;
