import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import { StarFilledIcon } from '../../icons/StarFilledIcon';
import { Chip } from './Chip';

// `ChipProps` is a discriminated union (filter role vs. tag role), which
// Storybook's `args`-merging typing doesn't handle well — every story below
// renders its own hardcoded element instead of spreading `args` onto `Chip`,
// and any onChange/onRemove spy is a plain module-scope `fn()` shared between
// a story's `render` and `play` closures, not routed through Storybook args.
const meta = {
  component: Chip,
  tags: ['!dev', '!autodocs'],
  // Satisfies the filter-role branch of the union so `args` isn't required
  // again on every individual story below (each overrides via its own
  // `render`, ignoring these defaults entirely).
  args: { checked: false, onChange: () => {}, children: 'Chip' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilterChipTogglesOnClick: Story = {
  render: () => {
    function Wrapper() {
      const [checked, setChecked] = useState(false);
      return (
        <Chip checked={checked} onChange={setChecked}>
          Bussit
        </Chip>
      );
    }
    return <Wrapper />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('checkbox', { name: 'Bussit' });
    await expect(chip).not.toBeChecked();
    await userEvent.click(chip);
    await expect(chip).toBeChecked();
  },
};

const onChangeSpy = fn();
export const FilterChipCallsOnChange: Story = {
  render: () => (
    <Chip checked={false} onChange={onChangeSpy}>
      Ratikat
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('checkbox', { name: 'Ratikat' });
    await userEvent.click(chip);
    await expect(onChangeSpy).toHaveBeenCalledWith(true);
  },
};

export const FilterChipShowsCheckmarkWhenSelected: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <div data-testid="unselected-wrapper">
        <Chip checked={false} onChange={() => {}}>
          Unselected
        </Chip>
      </div>
      <div data-testid="selected-wrapper">
        <Chip checked onChange={() => {}}>
          Selected
        </Chip>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('unselected-wrapper').querySelector('svg')).toBeNull();
    await expect(canvas.getByTestId('selected-wrapper').querySelector('svg')).not.toBeNull();
  },
};

export const FilterChipAcceptsCustomSelectedIcon: Story = {
  render: () => (
    <Chip checked onChange={() => {}} selectedIcon={<StarFilledIcon data-testid="star-icon" />}>
      Suosikki
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-testid="star-icon"]')).not.toBeNull();
  },
};

export const FilterChipLeadingIconHiddenWhenSelected: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <div data-testid="unselected-wrapper">
        <Chip
          checked={false}
          onChange={() => {}}
          icon={<StarFilledIcon data-testid="leading-icon" />}
        >
          Suosikki
        </Chip>
      </div>
      <div data-testid="selected-wrapper">
        <Chip checked onChange={() => {}} icon={<StarFilledIcon data-testid="leading-icon" />}>
          Suosikki
        </Chip>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByTestId('unselected-wrapper').querySelector('[data-testid="leading-icon"]')
    ).not.toBeNull();
    await expect(
      canvas.getByTestId('selected-wrapper').querySelector('[data-testid="leading-icon"]')
    ).toBeNull();
  },
};

const filterDisabledSpy = fn();
export const FilterChipDisabledBlocksToggle: Story = {
  render: () => (
    <Chip checked={false} onChange={filterDisabledSpy} disabled>
      Poissa käytöstä
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('checkbox', { name: 'Poissa käytöstä' });
    await expect(chip).toBeDisabled();
    await userEvent.click(chip, { pointerEventsCheck: 0 });
    await expect(filterDisabledSpy).not.toHaveBeenCalled();
  },
};

export const TagChipRendersLabelAndDismiss: Story = {
  render: () => (
    <Chip onRemove={() => {}} removeLabel="Poista Hervanta">
      Hervanta
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Hervanta')).not.toBeNull();
    await expect(canvas.getByRole('button', { name: 'Poista Hervanta' })).not.toBeNull();
  },
};

const onRemoveSpy = fn();
export const TagChipCallsOnRemove: Story = {
  render: () => (
    <Chip onRemove={onRemoveSpy} removeLabel="Poista Hervanta">
      Hervanta
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: 'Poista Hervanta' });
    await userEvent.click(dismiss);
    await expect(onRemoveSpy).toHaveBeenCalledTimes(1);
  },
};

const keyboardRemoveSpy = fn();
export const TagChipDismissIsKeyboardReachable: Story = {
  render: () => (
    <Chip onRemove={keyboardRemoveSpy} removeLabel="Poista Hervanta">
      Hervanta
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: 'Poista Hervanta' });
    dismiss.focus();
    await expect(dismiss).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(keyboardRemoveSpy).toHaveBeenCalledTimes(1);
  },
};

const tagDisabledSpy = fn();
export const TagChipDisabledBlocksRemoval: Story = {
  render: () => (
    <Chip onRemove={tagDisabledSpy} removeLabel="Poista Hervanta" disabled>
      Hervanta
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: 'Poista Hervanta' });
    await expect(dismiss).toBeDisabled();
    await userEvent.click(dismiss, { pointerEventsCheck: 0 });
    await expect(tagDisabledSpy).not.toHaveBeenCalled();
  },
};

export const FilterChipColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Chip checked={false} onChange={() => {}}>
        Bussit
      </Chip>
      <Chip checked onChange={() => {}}>
        Ratikat
      </Chip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unselectedLabel = canvas
      .getByRole('checkbox', { name: 'Bussit' })
      .closest('div')
      ?.querySelector('label');
    const selectedLabel = canvas
      .getByRole('checkbox', { name: 'Ratikat' })
      .closest('div')
      ?.querySelector('label');
    await expect(unselectedLabel).not.toBeNull();
    await expect(selectedLabel).not.toBeNull();
    // Unselected: outline only — Input-states/Default (neutral 600, #52525b).
    await expect(getComputedStyle(unselectedLabel!).borderColor).toBe('rgb(82, 82, 91)');
    // Selected: brand-blue border (Primary-states/Default, #29549a) + tinted fill
    // (Background/Selected/Default, warm neutral #f1eeeb).
    await expect(getComputedStyle(selectedLabel!).borderColor).toBe('rgb(41, 84, 154)');
    await expect(getComputedStyle(selectedLabel!).backgroundColor).toBe('rgb(241, 238, 235)');
  },
};

export const FilterChipIsFullyRounded: Story = {
  render: () => (
    <Chip checked={false} onChange={() => {}}>
      Bussit
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas
      .getByRole('checkbox', { name: 'Bussit' })
      .closest('div')
      ?.querySelector('label');
    await expect(label).not.toBeNull();
    const style = getComputedStyle(label!);
    // Fully rounded: radius is at least half the rendered height either way.
    const radius = parseFloat(style.borderRadius);
    const height = parseFloat(style.height);
    await expect(radius).toBeGreaterThanOrEqual(height / 2);
  },
};

export const TagChipColors: Story = {
  render: () => (
    <Chip onRemove={() => {}} removeLabel="Poista Hervanta">
      Hervanta
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Hervanta');
    const root = label.closest('span');
    await expect(root).not.toBeNull();
    // Neutral/100 tint (#f2f2f4), Text/Primary label (#2d2d32).
    await expect(getComputedStyle(root!).backgroundColor).toBe('rgb(242, 242, 244)');
    await expect(getComputedStyle(label).color).toBe('rgb(45, 45, 50)');
  },
};
