import { MantineProvider, createTheme, type MantineProviderProps } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import '../../theme/theme.css.ts';

// Variable-font @font-face declarations (Montserrat Variable, Open Sans Variable)
import '../../styles/index.css';

const theme = createTheme({
  fontFamily: 'Open Sans Variable, sans-serif',
  headings: {
    fontFamily: 'Montserrat Variable, sans-serif',
  },
});

export interface ThemeProviderProps extends MantineProviderProps {}

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <MantineProvider theme={theme} {...props}>
      {children}
    </MantineProvider>
  );
};
