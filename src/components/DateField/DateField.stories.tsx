import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
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

export const Default: Story = {};

export const CalendarOpens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await expect(canvas.getByTestId('date-field-calendar')).toBeInTheDocument();
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
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    // Stage day 16 (not day 1 which is the committed date)
    const allButtons = canvas.getAllByRole('button');
    const day16 = allButtons.find(
      (b) => b.textContent?.trim() === '16' && !b.hasAttribute('disabled')
    );
    await userEvent.click(day16!);
    // onChange not yet called — output still shows original
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
    // Confirm
    await userEvent.click(canvas.getByText('Valitse'));
    await expect(canvas.queryByTestId('date-field-calendar')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('output').textContent).toBe('16.08.2025');
  },
};
