import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from '@storybook/client-api';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Fieldset } from '../Fieldset';
import { RadioButton } from './RadioButton';

const meta: Meta<typeof RadioButton> = {
  argTypes: {
    id: { control: 'text' },
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
  args: {
    label: 'Label',
    checked: false,
    disabled: false,
    error: false,
  },
  component: RadioButton,
};

export default meta;
type Story = StoryObj<typeof meta>;

const visibleIcon = (radio: HTMLElement) => {
  const icons = [...(radio.parentElement?.querySelectorAll('svg') ?? [])].filter(
    (svg) => getComputedStyle(svg).display !== 'none'
  );
  return icons.length === 1 ? icons[0] : null;
};
const fillOf = (radio: HTMLElement) =>
  getComputedStyle(visibleIcon(radio)?.querySelector('path') as Element).fill;
const isShownChecked = (radio: HTMLElement) =>
  visibleIcon(radio)?.getAttribute('class')?.includes('iconChecked') ?? false;

export const Primary: Story = {
  args: { label: 'Option 1' },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      updateArgs({ checked: !checked });
      // preserve original onClick if provided
      try {
        args.onClick?.(e);
      } catch {}
    };
    return <RadioButton {...args} checked={checked} onClick={handleClick} />;
  },
};

export const Checked: Story = {
  args: { label: 'Selected option', checked: true },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      updateArgs({ checked: !checked });
      try {
        args.onClick?.(e);
      } catch {}
    };
    return <RadioButton {...args} checked={checked} onClick={handleClick} />;
  },
};

export const Disabled: Story = {
  args: { label: 'Disabled option', disabled: true },
  render: (args) => <RadioButton {...args} />,
};

export const Error: Story = {
  args: { label: 'Option with error', error: true },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      updateArgs({ checked: !checked });
      try {
        args.onClick?.(e);
      } catch {}
    };
    return <RadioButton {...args} checked={checked} onClick={handleClick} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const path = canvas.getByRole('radio').parentElement?.querySelector('svg path');
    await expect(path).toBeTruthy();
    // Figma Common/Error = Red/300 (#ae1e20).
    await expect(getComputedStyle(path as Element).fill).toBe('rgb(174, 30, 32)');
  },
};

export const RadioGroup: Story = {
  render: () => {
    const [selected, setSelected] = useArgs();
    const selectedValue = selected.selected || 'option1';

    return (
      <fieldset
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          border: 'none',
          padding: 0,
        }}
      >
        <label>Radio button group</label>
        <RadioButton
          label="Option 1"
          checked={selectedValue === 'option1'}
          onClick={() => setSelected({ selected: 'option1' })}
        />
        <RadioButton
          label="Option 2"
          checked={selectedValue === 'option2'}
          onClick={() => setSelected({ selected: 'option2' })}
        />
        <RadioButton
          label="Option 3"
          checked={selectedValue === 'option3'}
          onClick={() => setSelected({ selected: 'option3' })}
        />
        <RadioButton label="Disabled option" disabled checked={false} />
      </fieldset>
    );
  },
};

export const UncontrolledGroup: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <div>
      <RadioButton name="uc" label="One" defaultChecked />
      <RadioButton name="uc" label="Two" />
      <RadioButton name="uc" label="Three" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [one, two, three] = canvas.getAllByRole('radio');
    await expect([one, two, three].map(isShownChecked)).toEqual([true, false, false]);
    await userEvent.click(canvas.getByText('Three'));
    await expect([one, two, three].map(isShownChecked)).toEqual([false, false, true]);
    // Arrow keys move the selection natively without a click.
    await userEvent.keyboard('{ArrowUp}');
    await expect([one, two, three].map(isShownChecked)).toEqual([false, true, false]);
  },
};

export const ErrorDisabled: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Error disabled', error: true, disabled: true, checked: false },
  render: (args) => <RadioButton {...args} onChange={() => {}} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(fillOf(canvas.getByRole('radio'))).toBe('rgb(201, 201, 206)');
    await expect(getComputedStyle(canvas.getByText('Error disabled')).color).toBe(
      'rgb(104, 104, 114)'
    );
  },
};

// A native `<fieldset disabled>` disables its controls without a `disabled` prop on them.
export const InDisabledFieldset: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <Fieldset legend="Disabled group" disabled>
      <RadioButton name="g" label="Plain" />
      <RadioButton name="g" label="Pre-checked" defaultChecked />
    </Fieldset>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const radio of canvas.getAllByRole('radio')) {
      await expect(fillOf(radio)).toBe('rgb(201, 201, 206)');
    }
    for (const text of ['Plain', 'Pre-checked']) {
      await expect(getComputedStyle(canvas.getByText(text)).color).toBe('rgb(104, 104, 114)');
    }
  },
};

export const ErrorCheckedHover: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Error checked', error: true, checked: true },
  render: (args) => <RadioButton {...args} onChange={() => {}} />,
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio');
    await expect(fillOf(radio)).toBe('rgb(174, 30, 32)');
    await userEvent.hover(radio);
    await expect(fillOf(radio)).toBe('rgb(174, 30, 32)');
  },
};

// `RadioGroup` keeps its selection in Storybook args, which don't round-trip in the test runner.
const ControlledGroup = () => {
  const [selected, setSelected] = useState('option1');
  return (
    <div>
      {['option1', 'option2', 'option3'].map((value, i) => (
        <RadioButton
          key={value}
          label={`Option ${i + 1}`}
          checked={selected === value}
          onChange={() => setSelected(value)}
        />
      ))}
    </div>
  );
};

export const ControlledGroupUnchanged: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <ControlledGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Option 2'));
    const radios = canvas.getAllByRole('radio');
    await expect(isShownChecked(radios[1])).toBe(true);
    await expect(fillOf(radios[1])).toBe('rgb(41, 84, 154)');
    await expect(isShownChecked(radios[0])).toBe(false);
  },
};

// ── Dev-warning tests (#139: a controlled RadioButton that only wires `onClick` must not log
// React's "checked without onChange" warning, and a caller's own `onChange` must still fire) ──

let capturedConsoleErrors: string[] = [];

// Captured once at module scope so an aborted story can't leave a stub as the "original".
const nativeConsoleError = console.error;

const captureConsoleErrors = () => {
  capturedConsoleErrors = [];
  console.error = (...messageArgs: unknown[]) => {
    capturedConsoleErrors.push(String(messageArgs[0]));
    nativeConsoleError(...messageArgs);
  };
  return () => {
    console.error = nativeConsoleError;
  };
};

export const ControlledWithoutOnChangeDoesNotWarn: Story = {
  tags: ['!dev', '!autodocs'],
  // No `args` spread: meta's `onChange` action would otherwise populate `onChange` and mask the bug.
  render: () => <RadioButton label="Controlled option" checked onClick={() => {}} />,
  beforeEach: captureConsoleErrors,
  play: async ({ canvasElement }) => {
    // Positive control: "no error matches" is trivially true if the capture isn't live.
    const sentinel = 'radio-capture-sentinel';
    console.error(sentinel);
    await expect(capturedConsoleErrors).toContain(sentinel);

    const warned = () => capturedConsoleErrors.some((m) => /provided a `checked` prop/.test(m));
    await expect(warned()).toBe(false);
    await userEvent.click(within(canvasElement).getByRole('radio'));
    await expect(warned()).toBe(false);
  },
};

const onChangeSpy = fn();

export const ControlledForwardsCallerOnChange: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <RadioButton
      label="Controlled option"
      checked={false}
      onClick={() => {}}
      onChange={onChangeSpy}
    />
  ),
  beforeEach: () => {
    onChangeSpy.mockClear();
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('radio'));
    await expect(onChangeSpy).toHaveBeenCalledTimes(1);
  },
};
