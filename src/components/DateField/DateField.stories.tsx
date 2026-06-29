import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import dayjs from 'dayjs';
import { DateField } from './DateField';

const meta = {
  component: DateField,
  // Most DateField stories are browser test specs (they have a `play` fn), not
  // documentation. Default every story to test-only: still run by the vitest
  // addon (the `test` tag is untouched) but hidden from the sidebar (`!dev`) and
  // the autodocs page (`!autodocs`) so the docs stay a small, curated set. The
  // documentation examples below opt back in with `tags: docExample`.
  tags: ['!dev', '!autodocs'],
  args: {
    calendarButtonLabel: 'Avaa kalenteri',
    prevMonthLabel: 'Edellinen kuukausi',
    nextMonthLabel: 'Seuraava kuukausi',
    label: 'Valitse päivämäärä',
    placeholder: 'PP.KK.VVVV',
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Re-adds the visibility tags that `meta` strips, marking a story as a
// documentation example shown in both the sidebar and the autodocs page.
const docExample = ['dev', 'autodocs'];

// ── Documentation examples (visible in sidebar + autodocs) ───────────────────
// These cover every distinct visual state; the interactive behaviours (opening
// the calendar, typing, clearing) are discoverable by interacting with them, so
// the behavioural/a11y stories further down stay test-only to keep docs focused.

export const Default: Story = { tags: docExample };

export const WithValue: Story = {
  tags: docExample,
  args: { value: new Date(2025, 7, 16) },
};

export const Disabled: Story = {
  tags: docExample,
  args: { disabled: true, value: new Date(2025, 7, 16) },
};

export const WithError: Story = {
  tags: docExample,
  args: { error: 'Päivämäärä on virheellinen' },
};

export const WithHelperText: Story = {
  tags: docExample,
  args: { helperText: 'Muoto: PP.KK.VVVV' },
};

export const WithMinMax: Story = {
  tags: docExample,
  args: {
    min: new Date(2025, 7, 10),
    max: new Date(2025, 7, 20),
    value: new Date(2025, 7, 16),
  },
};

// ── Accessibility tests ──────────────────────────────────────────────────────

// Captures console.error calls for the dev-warning test below.
let capturedConsoleErrors: string[] = [];

export const AccessibleNameViaAriaLabel: Story = {
  // With no visible label, an aria-label must give the input an accessible name.
  args: { label: undefined, 'aria-label': 'Päivämäärä' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV');
    await expect(input).toHaveAccessibleName('Päivämäärä');
  },
};

export const WarnsWithoutAccessibleName: Story = {
  // With neither label nor aria-label/aria-labelledby, the component must warn
  // the developer in dev (the input would otherwise be unnamed).
  args: { label: undefined },
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

export const InputHasFormatDescription: Story = {
  // The expected date format must be conveyed accessibly (not via placeholder
  // alone) — exposed through the input's description (WCAG 3.3.2).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV');
    await expect(input).toHaveAccessibleDescription(/päivä\.kuukausi\.vuosi/i);
  },
};

export const FormatDescriptionAlongsideHelperText: Story = {
  // When helper text is present, both it and the format hint are announced.
  args: { helperText: 'Valinnainen ohje' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV');
    await expect(input).toHaveAccessibleDescription(/Valinnainen ohje/);
    await expect(input).toHaveAccessibleDescription(/päivä\.kuukausi\.vuosi/i);
  },
};

export const TriggerIconTracksControlSize: Story = {
  // The calendar trigger icon must scale with the responsive control size (it is
  // sized to the button's line-height token), not stay a fixed 24px while the
  // field shrinks on small breakpoints. Asserted viewport-independently by
  // comparing the rendered icon width to the button's resolved line-height.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByLabelText('Avaa kalenteri');
    const icon = trigger.querySelector('svg') as SVGElement;
    await expect(icon).toBeTruthy();
    const lineHeightPx = parseFloat(getComputedStyle(trigger).lineHeight);
    const iconWidth = icon.getBoundingClientRect().width;
    await expect(iconWidth).toBeCloseTo(lineHeightPx, 0);
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
    await userEvent.click(await body.findByText('Vahvista'));
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
    // Invalid input is NOT silently discarded: an error is surfaced (WCAG 3.3.1)
    // and the typed text is retained so the user can correct it.
    await expect(await canvas.findByText('Virheellinen päivämäärä')).toBeInTheDocument();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input.value).toBe('ei-päivämäärä');
    // onChange was never called with the invalid text — committed value unchanged
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
  },
};

export const TypeOutOfRangeThenBlurShowsError: Story = {
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
    const input = canvas.getByPlaceholderText('PP.KK.VVVV') as HTMLInputElement;
    await userEvent.type(input, '01.08.2025'); // valid date, before min
    await userEvent.tab();
    // A parseable but out-of-range date gets its own, distinct message.
    await expect(
      await canvas.findByText('Päivämäärä on sallitun välin ulkopuolella')
    ).toBeInTheDocument();
    await expect(canvas.getByTestId('output').textContent).toBe('none');
  },
};

export const ErrorClearsWhenCorrected: Story = {
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
    const input = canvas.getByPlaceholderText('PP.KK.VVVV') as HTMLInputElement;
    await userEvent.type(input, 'xx');
    await userEvent.tab();
    await expect(await canvas.findByText('Virheellinen päivämäärä')).toBeInTheDocument();
    // Correcting the input clears the error and commits the valid date.
    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, '16.08.2025');
    await waitFor(() =>
      expect(canvas.queryByText('Virheellinen päivämäärä')).not.toBeInTheDocument()
    );
    await expect(canvas.getByTestId('output').textContent).toBe('16.08.2025');
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

export const MonthNavRespectsRange: Story = {
  args: {
    min: new Date(2025, 7, 10),
    max: new Date(2025, 7, 20),
    value: new Date(2025, 7, 16),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await body.findByTestId('date-field-calendar');
    // Previous month (July) is entirely before min (Aug 10) → arrow must be disabled
    await waitFor(() => expect(body.getByLabelText('Edellinen kuukausi')).toBeDisabled());
    // Next month (September) is entirely after max (Aug 20) → arrow must be disabled
    await waitFor(() => expect(body.getByLabelText('Seuraava kuukausi')).toBeDisabled());
  },
};

export const MonthChangeAnnounced: Story = {
  args: { value: new Date(2025, 7, 16) }, // August 2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await body.findByTestId('date-field-calendar');
    // Click "next month" to go from August → September
    await userEvent.click(body.getByLabelText('Seuraava kuukausi'));
    // Live region should announce "syyskuu 2025" (fi locale, lowercase MMMM).
    // Scope to THIS DateField's live region via its testid (avoids matching any
    // other aria-live region elsewhere in the suite, and the hidden Mantine header).
    const liveRegion = await body.findByTestId('date-field-live');
    await waitFor(() => expect(liveRegion.textContent).toMatch(/syyskuu 2025/i));
  },
};

export const YearSelectIncludesDisplayedYear: Story = {
  // No value + a past-only range: the calendar opens on today, whose year falls
  // outside [min, max]. The year <select> must still offer that year as an option
  // rather than silently falling back to the first option.
  args: {
    min: new Date(2020, 0, 1),
    max: new Date(2020, 11, 31),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    const yearSelect = within(calendar).getByRole('combobox', {
      name: 'Vuosi',
    }) as HTMLSelectElement;
    await expect(Number(yearSelect.value)).toBe(new Date().getFullYear());
  },
};

export const SwappedMinMaxYearOptions: Story = {
  // Misconfigured bounds (min after max) must not produce an empty year selector.
  args: {
    min: new Date(2030, 0, 1),
    max: new Date(2020, 0, 1),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    const yearSelect = within(calendar).getByRole('combobox', {
      name: 'Vuosi',
    }) as HTMLSelectElement;
    await expect(yearSelect.options.length).toBeGreaterThan(0);
  },
};

export const TodayDisabledOutsideRange: Story = {
  // When today is outside [min, max] it can never be staged, so the "Today"
  // button must be disabled rather than appear clickable and silently no-op.
  args: {
    min: new Date(2020, 0, 1),
    max: new Date(2020, 11, 31),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await body.findByTestId('date-field-calendar');
    await waitFor(() => expect(body.getByText('Tänään').closest('button')).toBeDisabled());
  },
};

export const InputHasNoPopupSemantics: Story = {
  // The editable input does not open the dialog (only the trigger button does),
  // so it must not advertise popup semantics (WCAG 4.1.2).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV');
    await expect(input).not.toHaveAttribute('aria-haspopup');
    await expect(input).not.toHaveAttribute('aria-expanded');
  },
};

export const TriggerControlsDialog: Story = {
  // The trigger button must be programmatically linked to the dialog it opens
  // via aria-controls → dialog id (WCAG 4.1.2 / APG date-picker pattern).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByLabelText('Avaa kalenteri');
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog');
    const controls = trigger.getAttribute('aria-controls');
    await expect(controls).toBeTruthy();
    await expect(dialog).toHaveAttribute('id', controls);
  },
};

export const InitialFocusOnSelectedDay: Story = {
  // Opening the calendar should move focus into the grid onto the selected day
  // (not the previous-month arrow), per the APG date-picker pattern (WCAG 2.4.3).
  args: { value: new Date(2025, 7, 16) }, // 16.08.2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await body.findByTestId('date-field-calendar');
    await waitFor(() => {
      const active = document.activeElement as HTMLElement;
      // The staged day is the only cell with aria-pressed="true".
      expect(active).toHaveAttribute('aria-pressed', 'true');
      expect(active.textContent?.trim()).toBe('16');
    });
  },
};

export const InitialFocusOnTodayWhenNoValue: Story = {
  // With no committed value, focus should land on today's cell.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await body.findByTestId('date-field-calendar');
    await waitFor(() => {
      const active = document.activeElement as HTMLElement;
      expect(active).toHaveAttribute('aria-current', 'date');
    });
  },
};

export const DialogIsModal: Story = {
  // A focus-trapped dialog must declare itself modal so AT treats the rest of
  // the page as inert (WCAG 4.1.2 / APG).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  },
};

export const TodayHasAriaCurrent: Story = {
  // Today is conveyed visually by a dashed outline; it must also be exposed
  // programmatically so screen-reader users can identify it (WCAG 1.3.1 / 1.4.1).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await body.findByTestId('date-field-calendar');
    // Mantine tags today's cell with data-today regardless of locale.
    const todayCell = document.querySelector('[data-today]') as HTMLElement;
    await expect(todayCell).toBeTruthy();
    await expect(todayCell).toHaveAttribute('aria-current', 'date');
  },
};

export const ClearButtonClearsValue: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date(2025, 7, 16));
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
    await expect(input.value).toBe('16.08.2025');
    // The clear (✕) button is present while the field has a value.
    const clear = canvas.getByLabelText('Tyhjennä päivämäärä');
    await userEvent.click(clear);
    // Field empties and the committed value is cleared via onChange(null).
    await waitFor(() => expect(input.value).toBe(''));
    await expect(canvas.getByTestId('output').textContent).toBe('none');
    // The ✕ is removed once the field is empty; focus moves to the trigger so it
    // isn't lost to <body> when the button it sat on disappears (WCAG 2.4.3).
    await expect(canvas.queryByLabelText('Tyhjennä päivämäärä')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByLabelText('Avaa kalenteri')).toHaveFocus());
  },
};

export const ClearButtonHiddenWhenEmpty: Story = {
  // Nothing to clear on an empty field, so the ✕ must not be present.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByLabelText('Tyhjennä päivämäärä')).not.toBeInTheDocument();
  },
};

export const ClearButtonHiddenWhenDisabled: Story = {
  // A disabled field can't be edited, so the clear affordance is suppressed.
  args: { disabled: true, value: new Date(2025, 7, 16) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByLabelText('Tyhjennä päivämäärä')).not.toBeInTheDocument();
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
