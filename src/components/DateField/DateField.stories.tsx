import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor, fireEvent } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import dayjs from 'dayjs';
import { DateField } from './DateField';
import { dayCellOutsideMonth, dayCellDisabled } from './DateField.css.ts';
import { vars } from '../../theme';

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    // A disabled trigger must not open the calendar.
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await expect(body.queryByTestId('date-field-calendar')).not.toBeInTheDocument();
    // The text input itself must also be disabled.
    await expect(canvas.getByPlaceholderText('PP.KK.VVVV')).toBeDisabled();
  },
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

export const WithRange: Story = {
  tags: docExample,
  // Two independent DateFields composed into a start/end range: each bounds
  // the other via min/max so the calendar can't stage an inverted range, and
  // DateField's own out-of-range validation (outOfRangeError) catches typed
  // input that slips past the calendar (e.g. typing an end date before the
  // already-committed start date).
  render: (args) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const startMax = endDate ? dayjs(endDate).subtract(1, 'day').toDate() : undefined;
    const endMin = startDate ? dayjs(startDate).add(1, 'day').toDate() : undefined;
    const rangeSummary =
      startDate && endDate
        ? `Valittu väli: ${dayjs(startDate).format('DD.MM.YYYY')}–${dayjs(endDate).format('DD.MM.YYYY')}`
        : 'Ei valittua väliä';
    return (
      // Outer gap keeps the summary close to the field it describes (the same
      // rhythm TextField uses between its own label/input/helper stack);
      // the inner gap gives the two independent fields real breathing room.
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: vars.components.input.spacing.verticalSpacing,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: vars.spacing['3'] }}>
          <DateField
            {...args}
            label="Alkupäivä"
            calendarButtonLabel="Avaa alkupäivän kalenteri"
            value={startDate}
            onChange={setStartDate}
            max={startMax}
          />
          <DateField
            {...args}
            label="Loppupäivä"
            calendarButtonLabel="Avaa loppupäivän kalenteri"
            value={endDate}
            onChange={setEndDate}
            min={endMin}
          />
        </div>
        <p>{rangeSummary}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const startInput = canvas.getByLabelText('Alkupäivä');
    const endInput = canvas.getByLabelText('Loppupäivä');

    await userEvent.type(startInput, '16.08.2025');
    await userEvent.tab();

    // An end date before the (now committed) start date is out of range.
    await userEvent.type(endInput, '10.08.2025');
    await userEvent.tab();
    await expect(
      await canvas.findByText('Päivämäärä on sallitun välin ulkopuolella')
    ).toBeInTheDocument();

    // Correcting to a date after the start commits normally.
    await userEvent.clear(endInput);
    await userEvent.type(endInput, '20.08.2025');
    await userEvent.tab();
    await waitFor(() =>
      expect(
        canvas.queryByText('Päivämäärä on sallitun välin ulkopuolella')
      ).not.toBeInTheDocument()
    );
    await expect(canvas.getByText('Valittu väli: 16.08.2025–20.08.2025')).toBeInTheDocument();
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
    const dialog = await body.findByTestId('date-field-calendar');
    await expect(dialog).toBeInTheDocument();

    // The dropshadow token must match Figma's semi-transparent black
    // (Effects/Dropshadow = #00000080), not a solid opaque grey.
    const popover = dialog.closest('[role="dialog"]')?.parentElement;
    await expect(popover).toBeTruthy();
    const boxShadow = getComputedStyle(popover as Element).boxShadow;
    await expect(boxShadow).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.5\)/);
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
    // Focus returns to the trigger that opened the calendar (WCAG 2.4.3).
    await waitFor(() => expect(canvas.getByLabelText('Avaa kalenteri')).toHaveFocus());
  },
};

export const CloseWithEscape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await body.findByTestId('date-field-calendar');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByTestId('date-field-calendar')).not.toBeInTheDocument());
    // Focus returns to the trigger that opened the calendar (WCAG 2.4.3).
    await waitFor(() => expect(canvas.getByLabelText('Avaa kalenteri')).toHaveFocus());
  },
};

export const CloseOnOutsideClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await body.findByTestId('date-field-calendar');
    await userEvent.click(document.body);
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

export const SelectYearNavigatesCalendar: Story = {
  args: { value: new Date(2025, 7, 16) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    const yearSelect = within(calendar).getByRole('combobox', { name: 'Vuosi' });
    await userEvent.selectOptions(yearSelect, '2026');
    await waitFor(() =>
      expect(within(calendar).getByRole('combobox', { name: 'Vuosi' })).toHaveValue('2026')
    );
  },
};

export const SelectMonthNavigatesCalendar: Story = {
  args: { value: new Date(2025, 7, 16) }, // August 2025 (month index 7)
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    const monthSelect = within(calendar).getByRole('combobox', { name: 'Kuukausi' });
    await userEvent.selectOptions(monthSelect, '9'); // October
    await waitFor(() =>
      expect(within(calendar).getByRole('combobox', { name: 'Kuukausi' })).toHaveValue('9')
    );
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
    // Focus returns to the trigger that opened the calendar (WCAG 2.4.3).
    await waitFor(() => expect(canvas.getByLabelText('Avaa kalenteri')).toHaveFocus());
  },
};

export const ConfirmWithNothingStagedIsNoOp: Story = {
  // Opening the calendar with no committed value stages nothing, so the Confirm
  // button is disabled (see `confirmDisabled`) — clicking it must not commit
  // anything or fire onChange, and the calendar stays open.
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
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    // Nothing staged yet — the Confirm button is disabled.
    const confirmButton = within(calendar).getByText('Valitse').closest('button');
    await expect(confirmButton).toBeDisabled();
    // Clicking a disabled button is a genuine no-op: nothing commits and the
    // calendar stays open.
    await userEvent.click(confirmButton!);
    await expect(body.getByTestId('date-field-calendar')).toBeInTheDocument();
    await expect(canvas.getByTestId('output').textContent).toBe('none');
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
    // Clicking Today must also announce the staged date via the live region
    // (fi locale, 'dddd D. MMMMta YYYY' form).
    const expectedAnnouncement = dayjs(new Date()).locale('fi').format('dddd LL');
    const liveRegion = await body.findByTestId('date-field-live');
    await waitFor(() => expect(liveRegion.textContent).toBe(expectedAnnouncement));
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

export const TypeSingleDigitDate: Story = {
  // Finnish dates are routinely written without leading zeros (1.8.2025), so the
  // field must accept single-digit day/month, not only the padded DD.MM.YYYY form.
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
    await userEvent.type(input, '1.8.2025'); // no leading zeros
    await userEvent.tab();
    await expect(canvas.queryByText('Virheellinen päivämäärä')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
  },
};

export const TypeDateWithSurroundingWhitespace: Story = {
  // Stray leading/trailing whitespace should not cause parsing to fail; the field
  // must trim the text before parsing so " 16.08.2025 " commits successfully.
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
    await userEvent.type(input, ' 16.08.2025 '); // leading and trailing spaces
    await userEvent.tab();
    await expect(canvas.queryByText('Virheellinen päivämäärä')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('output').textContent).toBe('16.08.2025');
  },
};

export const TypeImpossibleCalendarDateRejected: Story = {
  // A format-valid but calendar-impossible date (non-leap 29 Feb) must be rejected,
  // not silently rolled over to a real date.
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
    await userEvent.type(input, '29.02.2025'); // 2025 is not a leap year
    await userEvent.tab();
    await expect(await canvas.findByText('Virheellinen päivämäärä')).toBeInTheDocument();
    await expect(canvas.getByTestId('output').textContent).toBe('none');
  },
};

export const TypingThenBlurFiresOnChangeOnce: Story = {
  // Typing a complete valid date commits it; blurring must NOT re-fire onChange
  // with an equal value. Consumers comparing by reference (autosave, analytics,
  // useEffect deps) would otherwise see a spurious second change.
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV');
    await userEvent.type(input, '16.08.2025');
    await userEvent.tab(); // blur
    await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1));
    const committed = (args.onChange as ReturnType<typeof fn>).mock.calls[0][0] as Date;
    await expect(dayjs(committed).format('DD.MM.YYYY')).toBe('16.08.2025');
  },
};

export const UncontrolledRetainsTypedValue: Story = {
  // With no `value` prop the field manages its own committed state. Typing a
  // valid date and blurring must retain it, and the calendar opens on that month.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV') as HTMLInputElement;
    await userEvent.type(input, '16.08.2025');
    await userEvent.tab();
    await expect(input.value).toBe('16.08.2025');
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    await expect(Number(monthSelect.value)).toBe(7); // August
  },
};

export const TypeValidDateWhileCalendarOpen: Story = {
  // The focus trap only intercepts Tab (see useFocusTrap), so clicking into the
  // text input while the dialog is open is not blocked. Typing a valid date
  // there must still steer the already-open calendar to that month, AND update
  // the staged date — otherwise a later Confirm click would re-commit the
  // earlier (stale) staged date and silently overwrite the just-typed value.
  args: { value: new Date(2025, 7, 16) }, // August 2025
  render: (args) => {
    const [value, setValue] = useState<Date | null>(args.value ?? null);
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
    const calendar = await body.findByTestId('date-field-calendar');
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    await expect(Number(monthSelect.value)).toBe(7); // August
    const input = canvas.getByPlaceholderText('PP.KK.VVVV') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, '24.12.2025'); // December
    await waitFor(() => expect(Number(monthSelect.value)).toBe(11));
    // Confirm must re-commit the just-typed date, not a stale earlier staged one.
    await userEvent.click(await body.findByText('Valitse'));
    await waitFor(() => expect(body.queryByTestId('date-field-calendar')).not.toBeInTheDocument());
    await expect(canvas.getByTestId('output').textContent).toBe('24.12.2025');
  },
};

export const EmptyBlurRevertsToCommitted: Story = {
  // Clearing the text and blurring is not a clear action: it silently reverts to
  // the committed value (the explicit ✕ button is the way to clear) and must not
  // fire onChange(null).
  args: { value: new Date(2025, 7, 16), onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV') as HTMLInputElement;
    await expect(input.value).toBe('16.08.2025');
    await userEvent.clear(input);
    await userEvent.tab();
    await waitFor(() => expect(input.value).toBe('16.08.2025'));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ArrowKeysNavigateGrid: Story = {
  // Arrow keys move day-to-day in the grid and Enter stages the focused day
  // (APG date-picker keyboard pattern).
  args: { value: new Date(2025, 7, 16) },
  render: (args) => {
    const [value, setValue] = useState<Date | null>(args.value ?? null);
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
    await body.findByTestId('date-field-calendar');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('16')
    );
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('17')
    );
    await userEvent.keyboard('{Enter}');
    await userEvent.click(await body.findByText('Valitse'));
    await waitFor(() => expect(canvas.getByTestId('output').textContent).toBe('17.08.2025'));
  },
};

export const ArrowRightCrossesToNextMonth: Story = {
  // August 2025 has 31 days; the 31st is the last real day in the grid.
  // Pressing → there must both focus September 1st and advance the header.
  args: { value: new Date(2025, 7, 31) }, // 31.08.2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('31')
    );
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('1')
    );
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    await waitFor(() => expect(monthSelect.value).toBe('8')); // September
  },
};

export const ArrowLeftCrossesToPreviousMonth: Story = {
  // 1 August 2025 is the first real day in its month; ← must land on 31 July.
  args: { value: new Date(2025, 7, 1) }, // 01.08.2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('1')
    );
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('31')
    );
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    await waitFor(() => expect(monthSelect.value).toBe('6')); // July
  },
};

export const ArrowDownCrossesToNextMonth: Story = {
  // August 2025: Monday 25th starts the grid's last full week entirely inside
  // August (25-31, since the 31st is a Sunday). ↓ from the 25th lands on
  // September 1st, the first cell of the following row.
  args: { value: new Date(2025, 7, 25) }, // 25.08.2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('25')
    );
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('1')
    );
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    await waitFor(() => expect(monthSelect.value).toBe('8')); // September
  },
};

export const ArrowUpCrossesToPreviousMonth: Story = {
  // 1 August 2025 sits in the grid's first row (Mon 28 Jul - Sun 3 Aug).
  // ↑ from the 1st goes back 7 days to 25 July, the row above.
  args: { value: new Date(2025, 7, 1) }, // 01.08.2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('1')
    );
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('25')
    );
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    await waitFor(() => expect(monthSelect.value).toBe('6')); // July
  },
};

export const ArrowRightBlockedWhenNextMonthOutOfRange: Story = {
  // max ends the range on 31 August 2025 — September is entirely out of
  // range, so → from the last day must do nothing (matches the header's
  // disabled next-month arrow in the same situation).
  args: { value: new Date(2025, 7, 31), max: new Date(2025, 7, 31) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('31')
    );
    await userEvent.keyboard('{ArrowRight}');
    // Give any (incorrect) async focus/month change a chance to happen, then
    // assert nothing moved.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('31');
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    expect(monthSelect.value).toBe('7'); // still August
  },
};

export const ArrowDownBlockedWhenTargetDayDisabled: Story = {
  // max ends the range on 3 September — September is PARTIALLY in range
  // (1st-3rd), but the ArrowDown target (Aug 28 + 7 days = Sept 4) is not.
  // Crossing must be blocked rather than landing on a disabled cell.
  args: { value: new Date(2025, 7, 28), max: new Date(2025, 8, 3) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    await waitFor(() =>
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('28')
    );
    await userEvent.keyboard('{ArrowDown}');
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('28');
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    expect(monthSelect.value).toBe('7'); // still August
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

export const ExternalErrorTakesPrecedence: Story = {
  // A consumer-supplied `error` always wins over the field's own validation
  // message (`error ?? internalError`) — even while typed text is unparseable
  // and would otherwise surface `invalidDateError`.
  args: { error: 'Ulkoinen virhe' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('PP.KK.VVVV') as HTMLInputElement;
    await userEvent.type(input, 'ei-päivämäärä');
    await userEvent.tab();
    await expect(await canvas.findByText('Ulkoinen virhe')).toBeInTheDocument();
    await expect(canvas.queryByText('Virheellinen päivämäärä')).not.toBeInTheDocument();
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

export const MonthOptionsRespectRange: Story = {
  // Months entirely outside [min, max] must be disabled in the header select, so
  // the user can't navigate to an all-disabled grid with no feedback.
  args: {
    min: new Date(2025, 7, 10),
    max: new Date(2025, 7, 20), // August 2025 only
    value: new Date(2025, 7, 16),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    // August (index 7) is in range; December (index 11) is not.
    await expect(monthSelect.options[7].disabled).toBe(false);
    await expect(monthSelect.options[11].disabled).toBe(true);
  },
};

export const YearOptionsRespectRange: Story = {
  // A past-only range with no value opens on today, so getYearRange spans the
  // gap between the range and the current year. Those in-between years are fully
  // out of range and must be disabled; the in-range year stays selectable.
  args: {
    min: new Date(2020, 0, 1),
    max: new Date(2020, 11, 31), // 2020 only
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    const yearSelect = within(calendar).getByRole('combobox', {
      name: 'Vuosi',
    }) as HTMLSelectElement;
    const optionFor = (year: string) =>
      Array.from(yearSelect.options).find((o) => o.value === year);
    // 2020 is in range; a year between 2020 and today is not.
    await expect(optionFor('2020')?.disabled).toBe(false);
    const inBetween = optionFor(String(new Date().getFullYear() - 1));
    await expect(inBetween).toBeTruthy();
    await expect(inBetween?.disabled).toBe(true);
  },
};

export const HeaderSelectLabelsAreConfigurable: Story = {
  // The year/month select accessible names are props (like every other label),
  // so the component can be localised beyond the Finnish defaults.
  args: { yearLabel: 'Year', monthLabel: 'Month' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    await expect(within(calendar).getByRole('combobox', { name: 'Year' })).toBeInTheDocument();
    await expect(within(calendar).getByRole('combobox', { name: 'Month' })).toBeInTheDocument();
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
  // Misconfigured bounds (min after max) must not produce an empty year selector
  // — and the normalized [2020, 2030] range must actually accept dates in
  // between (e.g. 2025), not just render options.
  args: {
    min: new Date(2030, 0, 1),
    max: new Date(2020, 0, 1),
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
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    const yearSelect = within(calendar).getByRole('combobox', {
      name: 'Vuosi',
    }) as HTMLSelectElement;
    await expect(yearSelect.options.length).toBeGreaterThan(0);
    const option2025 = Array.from(yearSelect.options).find((o) => o.value === '2025');
    await expect(option2025).toBeTruthy();
    await expect(option2025?.disabled).toBe(false);
    // Typing a date inside the swapped [2020, 2030] range must actually commit.
    const input = canvas.getByPlaceholderText('PP.KK.VVVV') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.type(input, '15.06.2025');
    await waitFor(() => expect(canvas.getByTestId('output').textContent).toBe('15.06.2025'));
  },
};

export const InvalidMinDoesNotDisableMaxRangeCheck: Story = {
  // An invalid min must be dropped (treated as absent) rather than disabling
  // every range check via NaN comparisons — the still-valid max keeps
  // restricting navigation on its own.
  args: {
    min: new Date('invalid'),
    max: new Date(2025, 7, 20),
    value: new Date(2025, 7, 16),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await body.findByTestId('date-field-calendar');
    // No lower bound (min was invalid, dropped) → previous month stays enabled.
    await waitFor(() => expect(body.getByLabelText('Edellinen kuukausi')).not.toBeDisabled());
    // max (Aug 20) is still enforced → next month (entirely after max) is disabled.
    await waitFor(() => expect(body.getByLabelText('Seuraava kuukausi')).toBeDisabled());
  },
};

export const WarnsOnInvalidMinOrMax: Story = {
  // Passing an unparseable min/max must warn in dev rather than silently
  // turning off every range check.
  args: { min: new Date('invalid'), max: new Date(2025, 7, 20) },
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
      expect(capturedConsoleErrors.some((m) => /`min`.*valid Date/i.test(m))).toBe(true)
    );
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

export const TriggerHasNoAriaControlsWhenClosed: Story = {
  // Popover.Dropdown fully unmounts once its close transition finishes (no
  // `keepMounted`), so the dialog's id doesn't exist in the DOM while closed.
  // aria-controls must reference an existing element (WCAG 4.1.2 / axe
  // aria-valid-attr-value) — pointing at a nonexistent id while collapsed is
  // itself a violation, so the attribute must be omitted until the dialog
  // actually renders.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByLabelText('Avaa kalenteri');
    await expect(trigger).not.toHaveAttribute('aria-controls');
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

export const DialogAccessibleNameDiffersFromTrigger: Story = {
  // The dialog has its own accessible name (calendarDialogLabel), distinct from
  // the trigger's accessible name (calendarButtonLabel). They serve different
  // semantic purposes and must be configurable independently.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByLabelText('Avaa kalenteri');
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog');
    // Dialog announces its purpose ("choose a date") not the button action
    await expect(dialog).toHaveAccessibleName('Valitse päivämäärä');
    // Trigger announces its action ("open calendar"), not the dialog's purpose
    await expect(trigger).toHaveAccessibleName('Avaa kalenteri');
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
    // Staging a day must also be announced via the live region (fi locale).
    const liveRegion = await body.findByTestId('date-field-live');
    await waitFor(() => expect(liveRegion.textContent).toMatch(/lauantai 16\. elokuuta 2025/i));
  },
};

export const DisabledDayCellClickIsNoOp: Story = {
  // Clicking a disabled day cell (outside [min, max]) must not stage anything —
  // the committed value stays whatever it was before the click.
  args: {
    min: new Date(2025, 7, 10),
    max: new Date(2025, 7, 20),
  },
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date(2025, 7, 16)); // 16.08.2025
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
    const calendar = await body.findByTestId('date-field-calendar');
    // Day 25 is after `max` (Aug 20), so it is disabled.
    const allButtons = within(calendar).getAllByRole('button');
    const disabledDay = allButtons.find(
      (b) => b.textContent?.trim() === '25' && b.hasAttribute('disabled')
    );
    await expect(disabledDay).toBeTruthy();
    // The disabled cell has `pointer-events: none`, so a real pointer click
    // (userEvent) can never reach it — dispatch the click event directly to
    // prove the handler itself is also a no-op, not just the mouse.
    fireEvent.click(disabledDay!);
    // Nothing gets staged — the disabled cell never becomes pressed.
    await expect(disabledDay).not.toHaveAttribute('aria-pressed', 'true');
    // Confirm — the committed value is unchanged since the click was a no-op.
    await userEvent.click(await body.findByText('Valitse'));
    await waitFor(() => expect(body.queryByTestId('date-field-calendar')).not.toBeInTheDocument());
    await expect(canvas.getByTestId('output').textContent).toBe('16.08.2025');
  },
};

export const DisabledDayMeetsContrast: Story = {
  // Same issue as OutsideMonthDayMeetsContrast, different class: Mantine's own
  // Day styles apply opacity: 0.5 to every :disabled/[data-disabled] cell too,
  // which we never cancelled for dayCellDisabled — genuinely out-of-range days
  // rendered noticeably more washed-out than outside-month cells, even though
  // both share the same "muted bg + disabled text" design intent.
  args: {
    min: new Date(2025, 7, 10),
    max: new Date(2025, 7, 20),
  },
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date(2025, 7, 16)); // 16.08.2025
    return <DateField {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    // Day 25 is after `max` (Aug 20), so it is disabled.
    const disabledDay = within(calendar)
      .getAllByRole('button')
      .find((b) => b.textContent?.trim() === '25' && b.className.includes(dayCellDisabled));
    await expect(disabledDay).toBeTruthy();
    await expect(getComputedStyle(disabledDay!).opacity).toBe('1');
  },
};

export const ClickOutsideMonthDayNavigatesAndStages: Story = {
  // August 2025 starts on a Friday, so with a Monday-first grid the first week
  // leads with four trailing days of July (28–31) — real, clickable outside-month
  // cells. Clicking one must both bring July into view (see the comment in
  // DateFieldCalendar's day onClick) and stage that July day, not just one or the
  // other — a prior fix that switched handleMonthChange/handleStagedDateChange to
  // closure-reading `setSession` calls let the second handler's update silently
  // clobber the first's within the same click, so only the staging half survived.
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date(2025, 7, 16)); // 16.08.2025
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
    const calendar = await body.findByTestId('date-field-calendar');
    const monthSelect = within(calendar).getByRole('combobox', {
      name: 'Kuukausi',
    }) as HTMLSelectElement;
    await expect(monthSelect.value).toBe('7'); // August

    // Day "31" appears twice in the grid — the real 31 August cell, and the
    // outside-month leading cell for 31 July. Only the latter carries
    // dayCellOutsideMonth, so filter on the class to click the right one.
    const allButtons = within(calendar).getAllByRole('button');
    const outsideJuly31 = allButtons.find(
      (b) => b.textContent?.trim() === '31' && b.className.includes(dayCellOutsideMonth)
    );
    await expect(outsideJuly31).toBeTruthy();
    await userEvent.click(outsideJuly31!);

    // (a) the month header/select must advance to the adjacent month (July).
    await waitFor(() => expect(monthSelect.value).toBe('6'));
    // (b) the clicked day must still be staged, not dropped by the navigation.
    // Mantine's <Calendar> re-renders a fresh grid of day-cell buttons for the
    // new month, so the earlier `outsideJuly31` element is stale — re-query.
    await waitFor(() => {
      const july31 = within(calendar)
        .getAllByRole('button')
        .find((b) => b.textContent?.trim() === '31' && !b.hasAttribute('disabled'));
      expect(july31).toHaveAttribute('aria-pressed', 'true');
    });

    // Confirming commits the staged July day, proving the staging survived
    // through to commit and wasn't just a transient DOM attribute.
    await userEvent.click(await body.findByText('Valitse'));
    await waitFor(() => expect(body.queryByTestId('date-field-calendar')).not.toBeInTheDocument());
    await expect(canvas.getByTestId('output').textContent).toBe('31.07.2025');
  },
};

export const OutsideMonthDayMeetsContrast: Story = {
  // Mantine's own Day styles apply `opacity: 0.5` to every [data-outside] cell
  // regardless of our colors, halving the rendered contrast of the already
  // AA-passing text.disabled-on-backgroundDisabled pair (4.93:1) down to ~2:1
  // — these cells stay real, clickable buttons (not `disabled`), so that
  // dimming isn't exempt from WCAG contrast. Asserts the override that cancels
  // it (see dayCellOutsideMonth's `opacity: 1 !important`) is in effect.
  args: { value: new Date(2025, 7, 16) }, // August 2025 — leads with outside July days
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const calendar = await body.findByTestId('date-field-calendar');
    const outsideJuly31 = within(calendar)
      .getAllByRole('button')
      .find((b) => b.textContent?.trim() === '31' && b.className.includes(dayCellOutsideMonth));
    await expect(outsideJuly31).toBeTruthy();
    await expect(getComputedStyle(outsideJuly31!).opacity).toBe('1');
  },
};
