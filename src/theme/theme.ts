import { createTheme } from '@mantine/core';
import { fontFamilyHeader, fontFamilyBody } from './themeVariables/fontFamily';
import { appBreakpoints } from './themeVariables/breakpoints';

// Import mantine core styles
import '@mantine/core/styles.layer.css';

// Import any other global CSS styles
import '../styles/index.css';

/**
 * General mantine theme configuration
 *
 * Override only necessary values to ensure that mantine variables
 * won't clash with vanilla variables.
 */
export const theme = createTheme({
  fontFamily: fontFamilyBody,
  fontFamilyMonospace: fontFamilyBody,
  headings: {
    fontFamily: fontFamilyHeader,
  },
  breakpoints: appBreakpoints,
});
