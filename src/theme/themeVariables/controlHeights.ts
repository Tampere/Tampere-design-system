import { Breakpoints } from './breakpoints';

// Shared height for single-line controls (buttons, text inputs, selects), responsive per
// breakpoint. Values come from the Figma `Breakpoint` variable collection and equal
// `input.lineHeight + 2 × spacing.sm` (Figma: Input/Line-height + 2 × Spacing/Small) at each
// breakpoint — keep this table in sync if either of those tokens changes. Every button variant
// and input renders at this height; borders are absorbed via `box-sizing: border-box`.
export const controlHeights: Record<Breakpoints, string> = {
  xxl: '52px',
  xl: '52px',
  lg: '52px',
  md: '42px',
  sm: '40px',
  xs: '40px',
};
