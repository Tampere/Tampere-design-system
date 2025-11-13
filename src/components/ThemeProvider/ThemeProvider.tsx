import { MantineProvider, type MantineProviderProps } from '@mantine/core';
import '@mantine/core/styles.css';
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

export interface ThemeProviderProps extends MantineProviderProps {}

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <MantineProvider {...props}>{children}</MantineProvider>;
};
