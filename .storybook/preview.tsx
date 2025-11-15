import type { Preview } from '@storybook/react-vite';
import { Box } from '@mantine/core';
import { ThemeProvider } from '../src/components';

export const decorators: Preview['decorators'] = [
  (Story) => (
    <ThemeProvider>
      <Box style={{ margin: '3rem' }}>
        <Story />
      </Box>
    </ThemeProvider>
  ),
];

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      controls: {
        sort: 'requiredFirst',
      },
    },
    controls: {
      sort: 'requiredFirst',
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
