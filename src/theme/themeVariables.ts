import { primitives } from './tokens/primitives';
import { brand } from './tokens/brand';
import { breakpoint } from './tokens/breakpoint';
import { getTheme } from './tokens/theme';

export { primitives, brand, breakpoint };
export const themeVariables = { primitives, brand, breakpoint, theme: getTheme('md') } as const;
export type ThemeVariables = typeof themeVariables;
