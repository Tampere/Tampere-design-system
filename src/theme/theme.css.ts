import { themeToVars } from '@mantine/vanilla-extract';
import { theme } from './theme';

// Get mantine CSS variables object
// Since we are mostly using vanilla variables, most of the default
// mantine variables can be ignored.
// Copy necessary variables and functions to the exported vars object.
const mantineVars = themeToVars(theme);

export const vars = {
  lightSelector: mantineVars.lightSelector,
  darkSelector: mantineVars.darkSelector,
  largerThan: mantineVars.largerThan,
  smallerThan: mantineVars.smallerThan,
};
