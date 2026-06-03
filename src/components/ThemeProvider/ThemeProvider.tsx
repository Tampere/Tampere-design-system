// If need to remove all Mantine styling, use HeadlessMantineProvider
import { MantineProvider, type MantineProviderProps } from '@mantine/core';
import { theme } from '../../theme';

/*
const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
});
*/

export interface ThemeProviderProps extends MantineProviderProps {}

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <MantineProvider theme={theme} {...props}>
      {children}
    </MantineProvider>
  );
};
