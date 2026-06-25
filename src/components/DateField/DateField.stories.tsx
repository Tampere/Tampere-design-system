import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from 'storybook/test';
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
