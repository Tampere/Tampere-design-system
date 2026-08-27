import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import { StarFilledIcon } from '../../icons/StarFilledIcon';
import { FavouritesOutlinedIcon } from '../../icons/FavouritesOutlinedIcon';
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
    <Chip checked={false} onChange={() => {}} icon={<FavouritesOutlinedIcon />}>
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
    await userEvent.click(chip);
    await expect(chip).not.toBeChecked();
  },
};

const keyboardToggleSpy = fn();
export const FilterChipTogglesViaKeyboard: Story = {
  render: () => {
    function Wrapper() {
      const [checked, setChecked] = useState(false);
      return (
        <Chip
          checked={checked}
          onChange={(next) => {
            setChecked(next);
            keyboardToggleSpy(next);
          }}
        >
          Bussit
        </Chip>
      );
    }
    return <Wrapper />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('checkbox', { name: 'Bussit' });
    chip.focus();
    await expect(chip).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(chip).toBeChecked();
    await expect(keyboardToggleSpy).toHaveBeenCalledWith(true);
  },
};

// Regression test: a filter chip with a leading `icon` used to swap its root
// element between `<span>` (unchecked, wrapped for the icon overlay) and a
// bare `<div>` (checked, no wrapper) on every toggle. React can't reconcile
// different root element types, so it unmounted and remounted the whole
// subtree — including the `<input>` — dropping keyboard focus the instant a
// user pressed Space to select an icon chip.
export const FilterChipWithLeadingIconKeepsFocusOnToggle: Story = {
  render: () => {
    function Wrapper() {
      const [checked, setChecked] = useState(false);
      return (
        <Chip checked={checked} onChange={setChecked} icon={<StarFilledIcon />}>
          Suosikki
        </Chip>
      );
    }
    return <Wrapper />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('checkbox', { name: 'Suosikki' });
    chip.focus();
    await expect(chip).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(chip).toBeChecked();
    await expect(chip).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(chip).not.toBeChecked();
    await expect(chip).toHaveFocus();
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

export const FilterChipCheckedDisabledColors: Story = {
  render: () => (
    <Chip checked onChange={() => {}} disabled>
      Valittu ja poissa käytöstä
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas
      .getByRole('checkbox', { name: 'Valittu ja poissa käytöstä' })
      .closest('div')
      ?.querySelector('label');
    await expect(label).not.toBeNull();
    const style = getComputedStyle(label!);
    // Figma's checked+disabled ("Default"+"Disabled") is a flat
    // States/Disabled fill (#c9c9ce) with no *visible* border — distinct
    // from unchecked+disabled, which keeps a white background with a gray
    // border instead (see `FilterChipUncheckedDisabledColors` below). The
    // border itself is present but transparent (not `none`), so the pill
    // keeps the same box size as every other chip — see
    // `FilterChipCheckedDisabledSizeMatchesEnabled` below.
    await expect(style.backgroundColor).toBe('rgb(201, 201, 206)');
    await expect(style.borderColor).toBe('rgba(0, 0, 0, 0)');
    await expect(style.color).toBe('rgb(104, 104, 114)');
  },
};

// Regression test: checked+disabled previously dropped its border with
// `border: 'none'` instead of a transparent border, which — combined with
// `box-sizing: border-box` — shrank the pill by 2 × the border width the
// moment a selected chip became disabled, visibly narrower than its
// still-enabled siblings for identical label text.
export const FilterChipCheckedDisabledSizeMatchesEnabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <div data-testid="enabled-wrapper">
        <Chip checked onChange={() => {}}>
          Valittu
        </Chip>
      </div>
      <div data-testid="disabled-wrapper">
        <Chip checked onChange={() => {}} disabled>
          Valittu
        </Chip>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const enabledLabel = canvas
      .getByTestId('enabled-wrapper')
      .querySelector('label') as HTMLElement;
    const disabledLabel = canvas
      .getByTestId('disabled-wrapper')
      .querySelector('label') as HTMLElement;
    await expect(enabledLabel).not.toBeNull();
    await expect(disabledLabel).not.toBeNull();
    await expect(getComputedStyle(disabledLabel).width).toBe(getComputedStyle(enabledLabel).width);
  },
};

export const FilterChipUncheckedDisabledColors: Story = {
  render: () => (
    <Chip checked={false} onChange={() => {}} disabled>
      Poissa käytöstä
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas
      .getByRole('checkbox', { name: 'Poissa käytöstä' })
      .closest('div')
      ?.querySelector('label');
    await expect(label).not.toBeNull();
    const style = getComputedStyle(label!);
    // Figma's unchecked+disabled ("Outlined"+"Disabled") keeps the white
    // resting background with just a gray States/Disabled border (#c9c9ce) —
    // distinct from checked+disabled above, which has no border at all.
    await expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(style.borderStyle).toBe('solid');
    await expect(style.borderColor).toBe('rgb(201, 201, 206)');
    await expect(style.color).toBe('rgb(104, 104, 114)');
  },
};

export const FilterChipLeadingIconMatchesTextColor: Story = {
  render: () => (
    <Chip
      checked={false}
      onChange={() => {}}
      icon={<FavouritesOutlinedIcon data-testid="leading-icon" />}
    >
      Suosikki
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas
      .getByRole('checkbox', { name: 'Suosikki' })
      .closest('div')
      ?.querySelector('label');
    const icon = canvasElement.querySelector('[data-testid="leading-icon"]')?.parentElement;
    await expect(label).not.toBeNull();
    await expect(icon).not.toBeNull();
    // The leading icon is rendered outside `label` (see `filterIconOverlay`
    // in Chip.css.ts) so it can't just inherit the text's `currentColor` —
    // its color is restated to track the same states.* progression as the
    // label text, resting-state here.
    await expect(getComputedStyle(icon!).color).toBe(getComputedStyle(label!).color);
  },
};

const leadingIconDisabledSpy = fn();
export const FilterChipLeadingIconDisabledColor: Story = {
  render: () => (
    <Chip
      checked={false}
      onChange={leadingIconDisabledSpy}
      disabled
      icon={<FavouritesOutlinedIcon data-testid="leading-icon" />}
    >
      Poissa käytöstä
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('[data-testid="leading-icon"]')?.parentElement;
    await expect(icon).not.toBeNull();
    // Text/Disabled (#686872) — matches the label's own disabled text color.
    await expect(getComputedStyle(icon!).color).toBe('rgb(104, 104, 114)');
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

export const TagChipWithLeadingIcon: Story = {
  render: () => (
    <Chip
      onRemove={() => {}}
      removeLabel="Poista Hervanta"
      icon={<StarFilledIcon data-testid="tag-icon" />}
    >
      Hervanta
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('[data-testid="tag-icon"]')).not.toBeNull();
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
    // Text/Disabled (#686872) — matches the filter role's disabled text color.
    await expect(getComputedStyle(canvas.getByText('Hervanta')).color).toBe('rgb(104, 104, 114)');
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
    // Unselected ("Outlined" in Figma): border AND text both track
    // Primary-states/Default (brand blue, #29549a) — not a neutral gray,
    // and not the same `text.primary` color the selected chip's text uses.
    await expect(getComputedStyle(unselectedLabel!).borderColor).toBe('rgb(41, 84, 154)');
    await expect(getComputedStyle(unselectedLabel!).color).toBe('rgb(41, 84, 154)');
    // Selected ("Default" in Figma): brand-blue border (Primary-states/Default,
    // #29549a) + tinted fill (Background/Selected/Default, warm neutral
    // #f1eeeb) + constant Text/Primary text color (#2d2d32) regardless of
    // interaction state.
    await expect(getComputedStyle(selectedLabel!).borderColor).toBe('rgb(41, 84, 154)');
    await expect(getComputedStyle(selectedLabel!).backgroundColor).toBe('rgb(241, 238, 235)');
    await expect(getComputedStyle(selectedLabel!).color).toBe('rgb(45, 45, 50)');
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
    // The label text is a direct child of `tagRoot` (itself a <span>), so
    // `getByText` already returns the chip's root element — no `.closest()`
    // walk-up needed.
    const root = canvas.getByText('Hervanta');
    // Neutral/100 tint (#f2f2f4), Text/Primary label (#2d2d32).
    await expect(getComputedStyle(root).backgroundColor).toBe('rgb(242, 242, 244)');
    await expect(getComputedStyle(root).color).toBe('rgb(45, 45, 50)');
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
    // See TagChipColors above — the label text's own element is already the
    // chip's root `tagRoot` <span>.
    const root = canvas.getByText('Hervanta');
    const style = getComputedStyle(root);
    const fontSize = parseFloat(style.fontSize);
    const height = parseFloat(style.height);
    // 2 × 4px vertical padding + 150% line-height of the label font size.
    await expect(height).toBeCloseTo(2 * 4 + fontSize * 1.5, 0);
  },
};

// Regression test: `className` used to land on different elements depending
// on chip state — the outer wrapper `<span>` when a leading icon was shown,
// but Mantine's own root `<div>` otherwise. Now that the wrapper always
// renders (see `FilterChipWithLeadingIconKeepsFocusOnToggle` above),
// `className` always lands on it, regardless of `icon`.
export const FilterChipClassNameLandsOnWrapper: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <div data-testid="no-icon-wrapper">
        <Chip checked={false} onChange={() => {}} className="custom-chip">
          Bussit
        </Chip>
      </div>
      <div data-testid="with-icon-wrapper">
        <Chip checked={false} onChange={() => {}} icon={<StarFilledIcon />} className="custom-chip">
          Suosikki
        </Chip>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const noIconRoot = canvas.getByTestId('no-icon-wrapper').firstElementChild;
    const withIconRoot = canvas.getByTestId('with-icon-wrapper').firstElementChild;
    await expect(noIconRoot).not.toBeNull();
    await expect(withIconRoot).not.toBeNull();
    await expect(noIconRoot!.tagName).toBe('SPAN');
    await expect(withIconRoot!.tagName).toBe('SPAN');
    await expect(noIconRoot!.classList.contains('custom-chip')).toBe(true);
    await expect(withIconRoot!.classList.contains('custom-chip')).toBe(true);
  },
};

export const TagChipClassNameLandsOnRoot: Story = {
  render: () => (
    <Chip onRemove={() => {}} removeLabel="Poista Hervanta" className="custom-chip">
      Hervanta
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.custom-chip');
    await expect(root).not.toBeNull();
    await expect(root?.textContent).toContain('Hervanta');
  },
};

// Regression test: without `--chip-icon-size` wired to `components.chip.iconSize`,
// Mantine's `iconWrapper` derived its `max-width` from its own unset 12px
// `sm`-tier default, clipping the 18px checkmark. Pins the rendered SVG size
// to the token value so a future Mantine upgrade or CSS-variable rename that
// silently reintroduces the clip is caught.
export const FilterChipIconMatchesIconSizeToken: Story = {
  render: () => (
    <Chip checked onChange={() => {}}>
      Ratikat
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('svg');
    await expect(icon).not.toBeNull();
    const style = getComputedStyle(icon!);
    await expect(style.width).toBe('18px');
    await expect(style.height).toBe('18px');
  },
};

export const TagChipDismissIconMatchesIconSizeToken: Story = {
  render: () => (
    <Chip onRemove={() => {}} removeLabel="Poista Hervanta">
      Hervanta
    </Chip>
  ),
  play: async ({ canvasElement }) => {
    const dismiss = within(canvasElement).getByRole('button', { name: 'Poista Hervanta' });
    const icon = dismiss.querySelector('svg');
    await expect(icon).not.toBeNull();
    const style = getComputedStyle(icon!);
    // The dismiss icon isn't wired to `chipIcon`/`--chip-icon-size` directly —
    // it's sized via `IconButton`'s own `size="sm"` slot (`icon.size.small`),
    // which happens to equal the same 18px `chip.iconSize` token.
    await expect(style.width).toBe('18px');
    await expect(style.height).toBe('18px');
  },
};
