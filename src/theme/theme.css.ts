// Using Vanilla Extract for primary theming. Do not try to override mantine theme tokens here but use completely new tokens defined in `tokens/`.

import {
  assignVars,
  createGlobalTheme,
  createThemeContract,
  globalStyle,
} from '@vanilla-extract/css';
import { breakpoint, type BreakpointKey, BREAKPOINT_KEYS_WIDEST_FIRST } from './tokens/breakpoint';
import { getTheme } from './tokens/theme';
import { themeVariables as defaultTheme } from './themeVariables';

export const vars = createThemeContract(defaultTheme);

createGlobalTheme(':root', vars, defaultTheme);

const breakpointKeys = BREAKPOINT_KEYS_WIDEST_FIRST;

function mediaQueryFor(currentBreakpoint: BreakpointKey) {
  const index = breakpointKeys.indexOf(currentBreakpoint);
  // breakpointKeys is widest-first (xxl…xs), so the next-NARROWER key sits at
  // index + 1 — do not "fix" this back to index - 1, that inverts every pairing.
  const lower = breakpointKeys[index + 1];
  const upper = currentBreakpoint === breakpointKeys[0] ? undefined : currentBreakpoint;
  if (!lower && upper) return `screen and (max-width: ${breakpoint[upper].appWidth})`;
  if (lower && upper)
    return `screen and (min-width: ${breakpoint[lower].appWidth}) and (max-width: ${breakpoint[upper].appWidth})`;
  return `screen and (min-width: ${breakpoint[lower].appWidth})`;
}

globalStyle(':root', {
  '@media': Object.fromEntries(
    // Declare narrowest-first (xs…xxl): globalStyle emits same-specificity :root
    // rules in this order, and at exact boundary widths two ranges match — the
    // widest/catch-all range (xxl) must come last so it wins the tie.
    [...breakpointKeys].reverse().map((currentBreakpoint) => [
      mediaQueryFor(currentBreakpoint),
      // Only `theme` varies by breakpoint (primitives/brand/breakpoint are
      // static) — scoping assignVars to just that tier avoids re-declaring
      // ~230 unchanged custom properties in every one of the six media queries.
      { vars: assignVars(vars.theme, getTheme(currentBreakpoint)) },
    ])
  ),
});
