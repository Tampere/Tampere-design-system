import { MantineProvider, createTheme, type MantineProviderProps } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import '../../theme/theme.css.ts';

import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/500.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
});

export interface ThemeProviderProps extends MantineProviderProps {}

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <MantineProvider theme={theme} {...props}>
      {children}
    </MantineProvider>
  );
};
