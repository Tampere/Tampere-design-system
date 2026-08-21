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

// Re-adds the visibility tags that `meta` strips, marking a story as a
// documentation example shown in both the sidebar and the autodocs page.
const docExample = ['dev', 'autodocs'];

// ── Documentation examples (visible in sidebar + autodocs) ───────────────────
// These cover every distinct visual state; the interactive behaviours (focus,
// keyboard toggle/removal) are discoverable by interacting with them, so the
// behavioural/a11y stories further down stay test-only to keep docs focused.

export const Default: Story = {
  tags: docExample,
  render: () => (
    <Chip checked={false} onChange={() => {}}>
      Bussit
    </Chip>
  ),
};

export const Selected: Story = {
  tags: docExample,
  render: () => (
    <Chip checked onChange={() => {}}>
      Ratikat
    </Chip>
  ),
};

export const WithLeadingIcon: Story = {
  tags: docExample,
  render: () => (
    <Chip checked={false} onChange={() => {}} icon={<StarFilledIcon />}>
      Suosikki
    </Chip>
  ),
};

export const RemovableTag: Story = {
  tags: docExample,
  render: () => (
    <Chip onRemove={() => {}} removeLabel="Poista Hervanta">
      Hervanta
    </Chip>
  ),
};

export const Disabled: Story = {
  tags: docExample,
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Chip checked={false} onChange={() => {}} disabled>
        Bussit
      </Chip>
      <Chip onRemove={() => {}} removeLabel="Poista Hervanta" disabled>
        Hervanta
      </Chip>
    </div>
  ),
};

// ── Test-only specs (hidden from sidebar/autodocs, still run as browser tests) ─

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

export const FilterChipHeightTracksLabelFontSize: Story = {
  // Same viewport-independent relationship check as the tag-role equivalent
  // below — `--chip-size` is fed from the same `components.chip.height`
  // formula, not a fixed Mantine size step.
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
    const fontSize = parseFloat(style.fontSize);
    const height = parseFloat(style.height);
    await expect(height).toBeCloseTo(2 * 4 + fontSize * 1.5, 0);
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

// Height is `components.chip.height` — a formula derived from the same
// breakpoint-varying label font-size used to render the text (see theme.ts),
// not a hardcoded literal. Asserting the formula holds at whatever
// breakpoint the test runs proves the wiring stays correct at every other
// breakpoint too, without needing to actually resize the viewport (same
// viewport-independent pattern as DateField's TriggerIconTracksControlSize).
export const TagChipHeightTracksLabelFontSize: Story = {
  render: () => (
    <Chip onRemove={() => {}} removeLabel="Poista Hervanta">
      Hervanta
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByText('Hervanta').closest('span');
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root!);
    const fontSize = parseFloat(style.fontSize);
    const height = parseFloat(style.height);
    // 2 × 4px vertical padding + 150% line-height of the label font size.
    await expect(height).toBeCloseTo(2 * 4 + fontSize * 1.5, 0);
  },
};
