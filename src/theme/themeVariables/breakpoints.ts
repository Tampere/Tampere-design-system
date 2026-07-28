import { em } from '@mantine/core';

export enum Breakpoint {
  'xxl',
  'xl',
  'lg',
  'md',
  'sm',
  'xs',
}

export type Breakpoints = keyof typeof Breakpoint;

// App breakpoints to control mantine breakpoints
// Mantine recommends using em values as breakpoint values
export const appBreakpoints = {
  xs: em(320),
  sm: em(480),
  md: em(768),
  lg: em(1024),
  xl: em(1440),
} as const;
