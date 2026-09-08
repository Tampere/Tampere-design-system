import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import { TimeField } from './TimeField';
import { timeInput } from './TimeField.css';

const meta = {
  component: TimeField,
  // Same curation as DateField: stories are browser test specs by default —
  // still run by the vitest addon, but hidden from the sidebar (`!dev`) and the
  // autodocs page (`!autodocs`). Documentation examples opt back in via `docExample`.
  tags: ['!dev', '!autodocs'],
  args: {
    inputLabel: 'Valitse kellonaika',
    pickerButtonLabel: 'Avaa kellonaikavalitsin',
  },
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

let capturedConsoleErrors: string[] = [];

export const Default: Story = { tags: docExample };

export const Uncontrolled: Story = {
  args: { defaultValue: '09:30', onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await expect(input).toHaveValue('09:30');
    // fireEvent-free: typing into a time input targets the focused segment.
    await userEvent.clear(input);
    await userEvent.type(input, '1045');
    await expect(input).toHaveValue('10:45');
    await expect(args.onChange).toHaveBeenLastCalledWith('10:45');
  },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('08:00');
    return (
      <>
        <TimeField {...args} value={value} onChange={setValue} />
        <span data-testid="echo">{value}</span>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await expect(input).toHaveValue('08:00');
    await userEvent.clear(input);
    await userEvent.type(input, '1115');
    // The parent's state, not internal state, drives the displayed value.
    await expect(canvas.getByTestId('echo')).toHaveTextContent('11:15');
  },
};

export const IsANativeTimeInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The native input is what supplies keyboard increments and spinbutton
    // semantics — if this regresses to type="text" the whole design is void.
    await expect(canvas.getByLabelText('Valitse kellonaika')).toHaveAttribute('type', 'time');
  },
};

export const WarnsWithoutAccessibleName: Story = {
  // With neither inputLabel nor aria-label/aria-labelledby, the component must
  // warn the developer in dev (the input would otherwise be unnamed).
  args: { inputLabel: undefined },
  beforeEach: () => {
    capturedConsoleErrors = [];
    const original = console.error;
    console.error = (...messageArgs: unknown[]) => {
      capturedConsoleErrors.push(String(messageArgs[0]));
    };
    return () => {
      console.error = original;
    };
  },
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /accessible name/i.test(m))).toBe(true)
    );
  },
};

export const HidesNativePickerIndicator: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    // Figma places the clock control OUTSIDE the field, so the browser's own
    // in-field indicator must not render — otherwise there are two clock icons.
    //
    // Reading getComputedStyle(input, '::-webkit-calendar-picker-indicator')
    // proved unreliable in this Chromium/Playwright combination — it reports
    // 'block' regardless of the `display: none` rule targeting that shadow
    // pseudo-element, so it cannot distinguish "rule applied" from "rule
    // absent". Assert structurally instead: the input carries the `timeInput`
    // class, which is the thing that contains the suppression rule (see
    // TimeField.css.ts). The visual result is confirmed manually in Storybook.
    await expect(input).toHaveClass(timeInput);
  },
};

export const MarksEmptySegmentsForPlaceholderStyling: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    // `data-empty` is what TimeField.css.ts keys its `--:--` placeholder
    // colouring off (Chromium's `-webkit-datetime-edit-*` shadow
    // pseudo-elements don't support `:not([attr])` matching, so this can't be
    // driven by a browser-set attribute). This only checks the attribute is
    // wired correctly — the rendered colour itself is verified visually, not
    // by a computed-style read, since that read is unreliable for these
    // pseudo-elements (see HidesNativePickerIndicator above).
    await expect(input).toHaveAttribute('data-empty', 'true');
    await userEvent.type(input, '0945');
    await expect(input).toHaveValue('09:45');
    await expect(input).not.toHaveAttribute('data-empty');
    await userEvent.clear(input);
    await expect(input).toHaveAttribute('data-empty', 'true');
  },
};

export const TriggerOpensNativePicker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika') as HTMLInputElement;
    // The picker panel is OS-level chrome Playwright cannot see into, so assert
    // the invocation rather than the rendered widget.
    const showPicker = fn();
    Object.defineProperty(input, 'showPicker', { value: showPicker, configurable: true });

    await userEvent.click(canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' }));
    await expect(showPicker).toHaveBeenCalledTimes(1);
  },
};

export const TriggerFallsBackToFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika') as HTMLInputElement;
    // Safari <16 has no showPicker, and Chromium throws NotAllowedError without
    // user activation. Either way the button must not be inert.
    Object.defineProperty(input, 'showPicker', {
      value: () => {
        throw new DOMException('not allowed', 'NotAllowedError');
      },
      configurable: true,
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' }));
    await expect(input).toHaveFocus();
  },
};

export const DisabledDisablesBothParts: Story = {
  tags: docExample,
  args: { disabled: true, defaultValue: '09:30' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Figma's one stated exception: disabling the component disables both subcomponents.
    await expect(canvas.getByLabelText('Valitse kellonaika')).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' })).toBeDisabled();
  },
};
