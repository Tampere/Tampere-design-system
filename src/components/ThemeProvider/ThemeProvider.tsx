import { MantineProvider, createTheme, type MantineProviderProps } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import '../../theme/theme.css.ts';

// Variable fonts. Imported as peer-dependency specifiers so they are left
// external in the built bundle (via peerDependencies + rollup-plugin-peer-deps-external)
// and resolved/bundled by the consumer's build. Provides the "Montserrat Variable"
// and "Open Sans Variable" families used below and in themeVariables.ts.
import '@fontsource-variable/montserrat';
import '@fontsource-variable/open-sans';

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
