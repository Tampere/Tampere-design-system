import { themeToVars } from '@mantine/vanilla-extract';
import {
  assignVars,
  createGlobalTheme,
  createThemeContract,
  globalStyle,
} from '@vanilla-extract/css';
import { theme } from './theme';
import { getComponents, themeVariables } from './themeVariables';

// Get mantine CSS variables object
// Since we are mostly using vanilla variables, most of the default
// mantine variables can be ignored.
const mantineVars = themeToVars(theme);

// Vars created from theme variables
// Make sure that they behave nicely with mantine variables
// use vars CSS variables object to access variables in files
export const vars = createThemeContract(themeVariables);
createGlobalTheme(':root', vars, themeVariables);

// Use mantine functions smallerThan and largerThan to get
// consistent breakpoints between mantine and vanilla extract variables
globalStyle(':root', {
  '@media': {
    [mantineVars.smallerThan('xs')]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('xs'),
      }),
    },
    [`(${mantineVars.largerThan('xs')}) and (${mantineVars.smallerThan('sm')})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('sm'),
      }),
    },
    [`(${mantineVars.largerThan('sm')}) and (${mantineVars.smallerThan('md')})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('md'),
      }),
    },
    [`(${mantineVars.largerThan('md')}) and (${mantineVars.smallerThan('lg')})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('lg'),
      }),
    },
    [`(${mantineVars.largerThan('lg')}) and (${mantineVars.smallerThan('xl')})`]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('xl'),
      }),
    },
    [mantineVars.largerThan('xl')]: {
      vars: assignVars(vars, {
        ...themeVariables,
        components: getComponents('xxl'),
      }),
    },
  },
});
