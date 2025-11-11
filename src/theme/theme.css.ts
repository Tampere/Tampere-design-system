// Using Vanilla Extract for primary theming. Do not try to override mantine theme tokens here but use completely new tokens defined in `themeVariables.ts`.

import {
  assignVars,
  createGlobalTheme,
  createThemeContract,
  globalStyle,
} from "@vanilla-extract/css";
import { breakpoints, getComponents, themeVariables } from "./themeVariables";

export const vars = createThemeContract(themeVariables);

createGlobalTheme(":root", vars, themeVariables);

globalStyle(":root", {
  "@media": {
    [`screen and (max-width: ${breakpoints.sm.appWidth})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents("sm"),
      }),
    },
    [`screen and (min-width: ${breakpoints.sm.appWidth}) and (max-width: ${breakpoints.md.appWidth})`]:
      {
        vars: assignVars(vars, {
          ...themeVariables,
          components: getComponents("sm"),
        }),
      },
    [`screen and (min-width: ${breakpoints.md.appWidth}) and (max-width: ${breakpoints.lg.appWidth})`]:
      {
        vars: assignVars(vars, {
          ...themeVariables,
          components: getComponents("md"),
        }),
      },
    [`screen and (min-width: ${breakpoints.lg.appWidth}) and (max-width: ${breakpoints.xl.appWidth})`]:
      {
        vars: assignVars(vars, {
          ...themeVariables,
          components: getComponents("lg"),
        }),
      },
    [`screen and (min-width: ${breakpoints.xl.appWidth})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents("xl"),
      }),
    },
  },
});
