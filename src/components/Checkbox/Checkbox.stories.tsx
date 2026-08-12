import { useArgs } from '@storybook/client-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
    error: { control: 'boolean' },
  },
  args: {
    label: 'Label',
    checked: false,
    disabled: false,
    error: false,
  },
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'I agree to the terms' },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: any) => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
      // preserve original onClick if provided
      try {
        (args as any).onClick?.(e);
      } catch {}
    };
    return <Checkbox {...args} checked={checked} onClick={handleClick} />;
  },
};

export const Checked: Story = {
  args: { label: 'Checked option', checked: true },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: any) => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
      try {
        (args as any).onClick?.(e);
      } catch {}
    };
    return <Checkbox {...args} checked={checked} onClick={handleClick} />;
  },
};

export const Disabled: Story = {
  args: { label: 'Disabled option', disabled: true },
  render: (args) => <Checkbox {...args} />,
};

export const Error: Story = {
  args: { label: 'Error option', error: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const path = canvas.getByRole('checkbox').parentElement?.querySelector('svg path');
    await expect(path).toBeTruthy();
    // Figma Common/Error = Red/300 (#ae1e20).
    await expect(getComputedStyle(path as Element).fill).toBe('rgb(174, 30, 32)');
  },
};

export const RichLabel: Story = {
  args: {
    label: (
      <span>
        Accept <strong>all</strong> cookies
      </span>
    ),
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: any) => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
      try {
        (args as any).onClick?.(e);
      } catch {}
    };
    return <Checkbox {...args} checked={checked} onClick={handleClick} />;
  },
};
