import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import dayjs from 'dayjs';
import { DateField } from './DateField';

const meta = {
  component: DateField,
  args: {
    calendarButtonLabel: 'Avaa kalenteri',
    prevMonthLabel: 'Edellinen kuukausi',
    nextMonthLabel: 'Seuraava kuukausi',
    label: 'Otsake',
    placeholder: 'PP.KK.VVVV',
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Render stories ──────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: new Date(2025, 7, 16) },
};

export const Disabled: Story = {
  args: { disabled: true, value: new Date(2025, 7, 16) },
};

export const WithError: Story = {
  args: { error: 'Päivämäärä on virheellinen' },
};

export const WithHelperText: Story = {
  args: { helperText: 'Muoto: PP.KK.VVVV' },
};

export const WithMinMax: Story = {
  args: {
    min: new Date(2025, 7, 10),
    max: new Date(2025, 7, 20),
    value: new Date(2025, 7, 16),
  },
};

// ── Interaction tests ────────────────────────────────────────────────────────

export const OpenCalendar: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    // Dropdown portals to document.body, outside canvasElement
    const body = within(document.body);
    await expect(await body.findByTestId('date-field-calendar')).toBeInTheDocument();
  },
};

export const CloseWithCancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    // Wait for calendar to appear in portal
    await body.findByTestId('date-field-calendar');
    await userEvent.click(await body.findByText('Peruuta'));
    // Calendar closes with a transition — use waitFor
    await waitFor(() => expect(body.queryByTestId('date-field-calendar')).not.toBeInTheDocument());
  },
};

export const NavigatePrevMonth: Story = {
  args: { value: new Date(2025, 7, 16) }, // August 2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    // Month select is in the portal
    const calendar = await body.findByTestId('date-field-calendar');
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    const before = Number(monthSelect.value); // 7 = August
    await userEvent.click(within(calendar).getByLabelText('Edellinen kuukausi'));
    await waitFor(() => expect(Number(monthSelect.value)).toBe(before - 1)); // 6 = July
  },
};

export const NavigateNextMonth: Story = {
  args: { value: new Date(2025, 7, 16) }, // August 2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    // Month select is in the portal
    const calendar = await body.findByTestId('date-field-calendar');
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    const before = Number(monthSelect.value); // 7 = August
    await userEvent.click(within(calendar).getByLabelText('Seuraava kuukausi'));
    await waitFor(() => expect(Number(monthSelect.value)).toBe(before + 1)); // 8 = September
  },
};

export const StageAndConfirm: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date(2025, 7, 1));
    return (
      <>
        <DateField {...args} value={value} onChange={setValue} />
        <div data-testid="output">{value ? dayjs(value).format('DD.MM.YYYY') : 'none'}</div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    // Stage day 16 (not day 1 which is the committed date) — buttons are in the portal
    const calendar = await body.findByTestId('date-field-calendar');
    const allButtons = within(calendar).getAllByRole('button');
    const day16 = allButtons.find(
      (b) => b.textContent?.trim() === '16' && !b.hasAttribute('disabled')
    );
    await expect(day16).toBeTruthy();
    await userEvent.click(day16!);
    // onChange not yet called — output still shows original
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
    // Confirm — button is in the portal
    await userEvent.click(await body.findByText('Valitse'));
    // Calendar closes with a transition — use waitFor
    await waitFor(() => expect(body.queryByTestId('date-field-calendar')).not.toBeInTheDocument());
    await expect(canvas.getByTestId('output').textContent).toBe('16.08.2025');
  },
};

export const CancelDiscardsStage: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date(2025, 7, 1));
    return (
      <>
        <DateField {...args} value={value} onChange={setValue} />
        <div data-testid="output">{value ? dayjs(value).format('DD.MM.YYYY') : 'none'}</div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    // Day buttons are in the portal
    const calendar = await body.findByTestId('date-field-calendar');
    const allButtons = within(calendar).getAllByRole('button');
    const day16 = allButtons.find(
      (b) => b.textContent?.trim() === '16' && !b.hasAttribute('disabled')
    );
    await expect(day16).toBeTruthy();
    await userEvent.click(day16!);
    // Cancel — button is in the portal
    await userEvent.click(await body.findByText('Peruuta'));
    // Calendar closes with a transition — use waitFor
    await waitFor(() => expect(body.queryByTestId('date-field-calendar')).not.toBeInTheDocument());
    // Staged date discarded — original value unchanged
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
  },
};

export const TodayButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    // Today button is in the portal
    await userEvent.click(await body.findByText('Tänään'));
    // Year select is in the portal
    const calendar = await body.findByTestId('date-field-calendar');
    const yearSelect = within(calendar).getByRole('combobox', {
      name: 'Vuosi',
    }) as HTMLSelectElement;
    await expect(Number(yearSelect.value)).toBe(new Date().getFullYear());
  },
};

export const TypeValidDate: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <>
        <DateField {...args} value={value} onChange={setValue} />
        <div data-testid="output">{value ? dayjs(value).format('DD.MM.YYYY') : 'none'}</div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV');
    await userEvent.type(input, '16.08.2025');
    await expect(canvas.getByTestId('output').textContent).toBe('16.08.2025');
  },
};

export const TypeInvalidDateThenBlur: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date(2025, 7, 1));
    return (
      <>
        <DateField {...args} value={value} onChange={setValue} />
        <div data-testid="output">{value ? dayjs(value).format('DD.MM.YYYY') : 'none'}</div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'ei-päivämäärä');
    await userEvent.tab(); // trigger blur
    // Field reverts to committed value; onChange was never called with the invalid text
    await expect(input.value).toBe('01.08.2025');
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
  },
};

export const TypeDateOutsideRange: Story = {
  args: {
    min: new Date(2025, 7, 10),
    max: new Date(2025, 7, 20),
  },
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <>
        <DateField {...args} value={value} onChange={setValue} />
        <div data-testid="output">{value ? dayjs(value).format('DD.MM.YYYY') : 'none'}</div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV');
    await userEvent.type(input, '01.08.2025'); // before min — out of range
    await expect(canvas.getByTestId('output').textContent).toBe('none');
  },
};

export const ControlledValueResync: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date(2025, 7, 16)); // 16.08.2025
    return (
      <>
        <DateField {...args} value={value} onChange={setValue} />
        <button onClick={() => setValue(new Date(2025, 11, 24))}>Set to 24.12.2025</button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV') as HTMLInputElement;
    // Initial value is displayed
    await expect(input.value).toBe('16.08.2025');
    // Parent programmatically changes the controlled value — no user typing
    await userEvent.click(canvas.getByText('Set to 24.12.2025'));
    // Input must resync to the new value without any user interaction
    await waitFor(() => expect(input.value).toBe('24.12.2025'));
  },
};

export const StagedDayHighlighted: Story = {
  args: { value: new Date(2025, 7, 1) }, // 01.08.2025 — calendar opens on August 2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    // Click day 16 to stage it
    const allButtons = within(calendar).getAllByRole('button');
    const day16 = allButtons.find(
      (b) => b.textContent?.trim() === '16' && !b.hasAttribute('disabled')
    );
    await expect(day16).toBeTruthy();
    await userEvent.click(day16!);
    // Staged day must have aria-pressed="true"; a non-staged day must not
    await waitFor(() => expect(day16).toHaveAttribute('aria-pressed', 'true'));
    const day10 = allButtons.find(
      (b) => b.textContent?.trim() === '10' && !b.hasAttribute('disabled')
    );
    await expect(day10).toBeTruthy();
    await expect(day10).not.toHaveAttribute('aria-pressed', 'true');
  },
};
