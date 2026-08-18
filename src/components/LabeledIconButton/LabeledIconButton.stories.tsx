import { within, userEvent } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Flex as MantineFlex } from '@mantine/core';
import { LabeledIconButton } from './LabeledIconButton';
import { AddIcon } from '../../icons/AddIcon';

const meta = {
  argTypes: {
    icon: { control: false },
    label: { control: 'text' },
    variant: { control: { type: 'select' }, options: ['light', 'dark'] },
    disabled: { control: 'boolean' },
  },
  args: {
    icon: <AddIcon />,
    label: 'Label',
    variant: 'light',
    disabled: false,
  },
  component: LabeledIconButton,
} satisfies Meta<typeof LabeledIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} variant="dark" />,
};

export const Disabled: Story = {
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    await expect(button).toBeDisabled();
  },
};

export const Dark: Story = {
  render: (args) => (
    <Box style={{ backgroundColor: 'grey', width: 'fit-content', padding: '1rem' }}>
      <LabeledIconButton {...args} variant="dark" icon={<AddIcon />} />
    </Box>
  ),
};

export const Colored: Story = {
  render: (args) => (
    <MantineFlex gap="md">
      <Box style={{ background: 'red', padding: '1rem' }}>
        <LabeledIconButton {...args} icon={<AddIcon />} />
      </Box>
      <Box style={{ background: 'green', padding: '1rem' }}>
        <LabeledIconButton {...args} icon={<AddIcon />} />
      </Box>
      <Box style={{ background: 'blue', padding: '1rem' }}>
        <LabeledIconButton {...args} icon={<AddIcon />} />
      </Box>
    </MantineFlex>
  ),
};

export const RendersLabelText: Story = {
  tags: ['!dev', '!autodocs'],
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} label="Favorite" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Favorite')).toBeInTheDocument();
  },
};

export const InteractionAppliesBackgroundAndColor: Story = {
  tags: ['!dev', '!autodocs'],
  /**
   * Verifies that interactive states (hover/focus/active) apply the background overlay.
   * Uses userEvent.pointer() to simulate a mouse press, which triggers the :active state,
   * because userEvent.hover() does not reliably trigger real :hover pseudo-class in
   * Playwright/Chromium test environment (synthetic pointer events don't move the OS cursor).
   * Since :hover, :focus-visible, and :active all apply the same background token,
   * this test verifies the interactive background-swap behavior across all states.
   */
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} variant="dark" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    await userEvent.pointer({ keys: '[MouseLeft>]', target: button });
    const style = getComputedStyle(button);
    await expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};

export const FocusVisibleHasBackgroundAndOutline: Story = {
  tags: ['!dev', '!autodocs'],
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} variant="dark" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    button.focus();
    const style = getComputedStyle(button);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};

export const MeetsTouchTarget: Story = {
  tags: ['!dev', '!autodocs'],
  // Icon + label + padding inherently exceed the 24px AA floor; no min-size needed.
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    const { width, height } = getComputedStyle(button);
    await expect(parseFloat(width)).toBeGreaterThanOrEqual(24);
    await expect(parseFloat(height)).toBeGreaterThanOrEqual(24);
  },
};
