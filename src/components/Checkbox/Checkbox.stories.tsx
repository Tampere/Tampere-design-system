import { Flex } from '@mantine/core';
import { useArgs } from '@storybook/client-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

function SelectAllExample() {
  const [children, setChildren] = useState([true, false, false]);
  const allChecked = children.every(Boolean);
  const noneChecked = children.every((c) => !c);

  return (
    <Flex direction="column" gap="xs">
      <Checkbox
        label="Select all"
        checked={allChecked}
        indeterminate={!allChecked && !noneChecked}
        onClick={() => setChildren(children.map(() => !allChecked))}
      />
      {children.map((checked, i) => (
        <Checkbox
          key={i}
          label={`Item ${i + 1}`}
          checked={checked}
          onClick={() => setChildren(children.map((c, idx) => (idx === i ? !c : c)))}
        />
      ))}
    </Flex>
  );
}

const meta = {
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
    error: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  args: {
    label: 'Label',
    checked: false,
    disabled: false,
    error: false,
    indeterminate: false,
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

export const Indeterminate: Story = {
  args: { label: 'Indeterminate option', indeterminate: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
    const path = checkboxInput.parentElement?.querySelector('svg path');
    await expect(path).toBeTruthy();
    // Figma Primary-states/Default = Blue/400 (#29549a).
    await expect(getComputedStyle(path as Element).fill).toBe('rgb(41, 84, 154)');

    // The browser's click activation steps reset the native `indeterminate` DOM property to
    // false; while the `indeterminate` prop stays true it must be reasserted after a click.
    await userEvent.click(checkboxInput);
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
  },
};

export const IndeterminateTakesPrecedenceOverChecked: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Both set', indeterminate: true, checked: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
    // Indeterminate icon's dash path, not the checked icon's checkmark path.
    const path = checkboxInput.parentElement?.querySelector('svg path:nth-of-type(2)');
    await expect(path?.getAttribute('d')).toBe('M20 11V13H4V11H20Z');
  },
};

export const SelectAll: Story = {
  args: { label: 'Select all' },
  render: () => <SelectAllExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [selectAll, item1, item2, item3] = canvas.getAllByRole('checkbox') as HTMLInputElement[];

    // Starts with only Item 1 checked: partial selection.
    await expect(selectAll.indeterminate).toBe(true);
    await expect(selectAll.checked).toBe(false);
    await expect(selectAll.getAttribute('aria-checked')).toBe('mixed');

    // Clicking "Select all" while indeterminate selects every item (not deselect).
    await userEvent.click(selectAll);
    await expect(selectAll.indeterminate).toBe(false);
    await expect(selectAll.checked).toBe(true);
    await expect(selectAll.getAttribute('aria-checked')).toBeNull();
    await expect(item1.checked).toBe(true);
    await expect(item2.checked).toBe(true);
    await expect(item3.checked).toBe(true);

    // Clicking "Select all" again while fully checked deselects every item.
    await userEvent.click(selectAll);
    await expect(selectAll.indeterminate).toBe(false);
    await expect(selectAll.checked).toBe(false);
    await expect(item1.checked).toBe(false);
    await expect(item2.checked).toBe(false);
    await expect(item3.checked).toBe(false);

    // Checking one item returns the parent to partial selection.
    await userEvent.click(item1);
    await expect(selectAll.indeterminate).toBe(true);
    await expect(selectAll.checked).toBe(false);

    // Checking the remaining items resolves the parent to fully checked.
    await userEvent.click(item2);
    await userEvent.click(item3);
    await expect(selectAll.indeterminate).toBe(false);
    await expect(selectAll.checked).toBe(true);

    // Unchecking one item returns the parent to indeterminate.
    await userEvent.click(item1);
    await expect(selectAll.indeterminate).toBe(true);
    await expect(selectAll.checked).toBe(false);

    // Unchecking all items resolves the parent to fully unchecked.
    await userEvent.click(item2);
    await userEvent.click(item3);
    await expect(selectAll.indeterminate).toBe(false);
    await expect(selectAll.checked).toBe(false);
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
