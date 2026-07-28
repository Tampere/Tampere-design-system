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
export const appBreakpoints: Record<Breakpoints, string> = {
  xxl: em(1920),
  xl: em(1440),
  lg: em(1024),
  md: em(768),
  sm: em(480),
  xs: em(320),
} as const;

export const appWidth: Record<Breakpoints, string> = {
  xxl: '1920px',
  xl: '1440px',
  lg: '1024px',
  md: '768px',
  sm: '480px',
  xs: '320px',
};
