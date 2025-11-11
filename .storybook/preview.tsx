import type { Preview } from '@storybook/react-vite'

import "@mantine/core/styles.css";
import "../src/theme/theme.css.ts";

import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/500.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";

import { Box, MantineProvider } from "@mantine/core";

export const decorators: Preview["decorators"] = [
  (Story) => (
    <MantineProvider>
      <Box style={{ margin: "3rem" }}> <Story />  </Box>
    </MantineProvider>
  ),
];


const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;