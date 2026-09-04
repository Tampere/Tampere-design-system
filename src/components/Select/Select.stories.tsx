import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, screen } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Select } from './Select';

const meta = {
  argTypes: {
    inputLabel: { control: 'text' },
    placeholder: { control: 'text' },
    options: { control: 'object' },
    required: { control: 'boolean' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    helperText: { control: 'text' },
    noResultsMessage: { control: 'text' },
    showSearchIcon: { control: 'boolean', description: 'Show left search icon' },
    clearButtonLabel: { control: 'text', description: 'aria-label for clear button' },
    expandButtonLabel: { control: 'text', description: 'aria-label for chevron when collapsed' },
    collapseButtonLabel: { control: 'text', description: 'aria-label for chevron when expanded' },
    onChange: { action: 'changed' },
  },
  args: {
    inputLabel: 'Select',
    placeholder: '',
    options: ['Option 1', 'Option 2'],
    required: false,
    error: '',
    disabled: false,
    helperText: '',
    noResultsMessage: '',
    showSearchIcon: false,
    clearButtonLabel: 'Clear',
    expandButtonLabel: 'Expand',
    collapseButtonLabel: 'Collapse',
  },
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    inputLabel: 'Hedelmävalinta',
    placeholder: 'Valitse hedelmä...',
    options: ['Omena', 'Banaani', 'Appelsiini', 'Mango'],
    required: false,
    error: '',
    disabled: false,
    helperText: 'Ohjeteksti tähän',
    noResultsMessage: 'Ei hakutuloksia',
  },
  render: (args) => <Select {...args} />,
};

export const Required: Story = {
  args: {
    inputLabel: 'Maa',
    required: true,
    options: ['Suomi', 'Ruotsi', 'Norja'],
  },
  render: (args) => <Select {...args} />,
};

export const Disabled: Story = {
  args: {
    inputLabel: 'Ei muokattavissa',
    disabled: true,
    options: ['Omena', 'Banaani'],
    placeholder: 'Ei valittavissa',
  },
  render: (args) => <Select {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toBeDisabled();

    await userEvent.click(input);
    // The dropdown renders in a portal (Combobox defaults to `withinPortal: true`),
    // so it's queried via the global `screen`, not `canvas` scoped to canvasElement.
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

export const WithError: Story = {
  args: {
    inputLabel: 'Kaupunki',
    error: 'Valinta on pakollinen',
    options: ['Tampere', 'Helsinki', 'Turku'],
  },
  render: (args) => <Select {...args} />,
};

export const WithHelperText: Story = {
  args: {
    inputLabel: 'Kieli',
    helperText: 'Valitse asiointikieli',
    options: ['Suomi', 'Englanti', 'Ruotsi'],
  },
  render: (args) => <Select {...args} />,
};

export const WithSearchIcon: Story = {
  args: {
    inputLabel: 'Hae vaihtoehtoa',
    showSearchIcon: true,
    options: ['Omena', 'Banaani', 'Appelsiini', 'Mango'],
  },
  render: (args) => <Select {...args} />,
};

/**
 * When the typed search text matches nothing, the dropdown shows `noResultsMessage`
 * instead of an empty list.
 */
export const NoSearchResults: Story = {
  args: {
    inputLabel: 'Hedelmävalinta',
    options: ['Omena', 'Banaani', 'Appelsiini', 'Mango'],
    noResultsMessage: 'Ei hakutuloksia',
  },
  render: (args) => <Select {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.click(input);
    await userEvent.type(input, 'xyz');

    // Dropdown content is portaled (Combobox defaults to `withinPortal: true`),
    // so it's queried via the global `screen`, not `canvas` scoped to canvasElement.
    await expect(screen.getByText('Ei hakutuloksia')).toBeInTheDocument();
  },
};

const manyOptions = Array.from({ length: 30 }, (_, i) => `Vaihtoehto ${i + 1}`);

/**
 * With enough options the dropdown hits its max height (`select.dropDownMaxHeight`
 * theme token, 350px) and the option list becomes scrollable rather than growing
 * indefinitely.
 */
export const ManyOptionsScrollable: Story = {
  args: {
    inputLabel: 'Valitse listalta',
    options: manyOptions,
  },
  render: (args) => <Select {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.click(input);

    // Dropdown content is portaled (Combobox defaults to `withinPortal: true`),
    // so it's queried via the global `screen`, not `canvas` scoped to canvasElement.
    const listbox = screen.getByRole('listbox');
    await expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight);
  },
};

/**
 * `options` can also be an array of `{ group, items }` to render the options
 * under group headers. Headers are shown but are not themselves selectable —
 * only the options within a group can be picked.
 */
export const GroupedOptions: Story = {
  args: {
    inputLabel: 'Kaupunginosa',
    options: [
      { group: 'Pirkanmaa', items: ['Tampere', 'Nokia', 'Ylöjärvi'] },
      { group: 'Uusimaa', items: ['Helsinki', 'Espoo', 'Vantaa'] },
    ],
  },
  render: (args) => <Select {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.click(input);

    // Dropdown content is portaled (Combobox defaults to `withinPortal: true`),
    // so it's queried via the global `screen`, not `canvas` scoped to canvasElement.
    await expect(screen.getByText('Pirkanmaa')).toBeInTheDocument();
    await expect(screen.getByText('Uusimaa')).toBeInTheDocument();

    const option = screen.getByRole('option', { name: 'Tampere' });
    await userEvent.click(option);

    await expect(input).toHaveValue('Tampere');
  },
};
