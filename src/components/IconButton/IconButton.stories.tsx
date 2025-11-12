import { Box, Flex } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '@treds';
import { MagnifierIcon } from 'src/icons/MagnifierIcon';

const meta = {
  component: IconButton,
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  render: (args) => (
    <Box style={{ backgroundColor: 'grey', width: 'fit-content' }}>
      <IconButton variant="dark" size="md" {...args}>
        <MagnifierIcon fill="white" />
      </IconButton>
    </Box>
  ),
};

export const Light: Story = {
  render: (args) => (
    <IconButton variant="light" size="md" {...args}>
      <MagnifierIcon fill="black" />
    </IconButton>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <IconButton disabled variant="light" size="md" {...args}>
      <MagnifierIcon fill="gray" />
    </IconButton>
  ),
};

export const Colored: Story = {
  render: (args) => (
    <Flex>
      <Box style={{ background: 'red', padding: '1rem' }}>
        <IconButton variant="light" size="md" {...args}>
          <MagnifierIcon fill="white" />
        </IconButton>
      </Box>
      <Box style={{ background: 'green', padding: '1rem' }}>
        <IconButton variant="light" size="md" {...args}>
          <MagnifierIcon fill="white" />
        </IconButton>
      </Box>
      <Box style={{ background: 'blue', padding: '1rem' }}>
        <IconButton variant="light" size="md" {...args}>
          <MagnifierIcon fill="white" />
        </IconButton>
      </Box>
    </Flex>
  ),
};
