import { createTheme } from '@mantine/core';

// Import mantine core styles
import '@mantine/core/styles.layer.css';

// Import any other global CSS styles
import '../styles/index.css';

/**
 * General mantine theme configuration
 *
 * Override only necessary values to ensure that mantine uses correct
 * values by default.
 */
export const theme = createTheme({
  fontFamily: 'Open Sans Variable, sans-serif',
  fontFamilyMonospace: 'Open Sans Variable, sans-serif',
  headings: {
    fontFamily: 'Montserrat Variable, sans-serif',
  },
});
