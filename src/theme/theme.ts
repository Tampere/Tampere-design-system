import { createTheme, em } from '@mantine/core';

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
  fontFamily: 'Open Sans Variable, sans-serif',
  fontFamilyMonospace: 'Open Sans Variable, sans-serif',
  headings: {
    fontFamily: 'Montserrat Variable, sans-serif',
  },
  breakpoints: {
    xs: em(320),
    sm: em(480),
    md: em(768),
    lg: em(1024),
    xl: em(1440),
  },
});
