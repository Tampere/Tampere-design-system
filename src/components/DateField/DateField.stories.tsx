import type { Meta, StoryObj } from '@storybook/react-vite';
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
