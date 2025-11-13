import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchField } from 'src/components';

const meta: Meta<typeof SearchField> = {
  argTypes: {
    inputLabel: { control: 'text' },
    data: { control: 'object' },
    searchButtonLabel: { control: 'text' },
    clearButtonLabel: { control: 'text' },
    onSearch: { action: 'searched' },
    onChange: { action: 'changed' },
  },
  args: {
    inputLabel: 'Search',
    data: [],
    searchButtonLabel: 'Search',
    clearButtonLabel: 'Clear',
  },
  component: SearchField,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    inputLabel: 'Osoite, kiinteistö-, lupa- tai rakennustunnus',
    data: [
      { value: 'pellavatehtaankatu', label: 'Pellavatehtaankatu' },
      { value: 'pirkankatu', label: 'Pirkankatu' },
      { value: 'pispalan-valtatie', label: 'Pispalan valtatie' },
      { value: 'paatie', label: 'Päätie' },
      { value: 'pohjolankatu', label: 'Pohjolankatu' },
      { value: 'puuvillatehtaankatu', label: 'Puuvillatehtaankatu' },
      { value: 'puutarhakatu', label: 'Puutarhakatu' },
      { value: 'pellervonkatu', label: 'Pellervonkatu' },
      { value: 'pappilankatu', label: 'Pappilankatu' },
      { value: 'peltokatu', label: 'Peltokatu' },
    ],
    searchButtonLabel: 'Search button',
    clearButtonLabel: 'Clear',
    onSearch: () => {},
    onChange: () => {},
  },
  render: (args) => <SearchField {...args} />,
};
