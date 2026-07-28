// Using Vanilla Extract for primary theming. Do not try to override mantine theme tokens here but use completely new tokens defined in `themeVariables.ts`.

import {
  assignVars,
  createGlobalTheme,
  createThemeContract,
  globalStyle,
} from '@vanilla-extract/css';
import { getComponents, themeVariables } from './themeVariables';
import { appWidth } from './themeVariables/breakpoints';

export const vars = createThemeContract(themeVariables);

createGlobalTheme(':root', vars, themeVariables);

globalStyle(':root', {
  '@media': {
    [`screen and (max-width: ${appWidth.xs})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('xs'),
      }),
    },
    [`screen and (min-width: ${appWidth.xs}) and (max-width: ${appWidth.sm})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('sm'),
      }),
    },
    [`screen and (min-width: ${appWidth.sm}) and (max-width: ${appWidth.md})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('md'),
      }),
    },
    [`screen and (min-width: ${appWidth.md}) and (max-width: ${appWidth.lg})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('lg'),
      }),
    },
    [`screen and (min-width: ${appWidth.lg}) and (max-width: ${appWidth.xl})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('xl'),
      }),
    },
    [`screen and (min-width: ${appWidth.xl})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('xxl'),
      }),
    },
  },
});
