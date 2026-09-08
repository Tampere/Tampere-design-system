import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { userEvent as browserUserEvent } from 'vitest/browser';
import { expect, fn } from 'storybook/test';
import { TimeField } from './TimeField';
import { timeInput } from './TimeField.css';
import { DateField } from '../DateField';

const meta = {
  component: TimeField,
  // Same curation as DateField: stories are browser test specs by default —
  // still run by the vitest addon, but hidden from the sidebar (`!dev`) and the
  // autodocs page (`!autodocs`). Documentation examples opt back in via `docExample`.
  tags: ['!dev', '!autodocs'],
  args: {
    label: 'Valitse kellonaika',
    pickerButtonLabel: 'Avaa kellonaikavalitsin',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Aikakenttä käyttää selaimen omaa kellonaikavalitsinta. Huomaa: `<input type="time">` ' +
          'näyttää kellonajan katsojan käyttöjärjestelmän kieliasetuksen mukaan, joten esimerkiksi ' +
          'en-US-asetuksella kenttä näyttää muodon `09:30 AM`. Luettu ja kirjoitettu arvo on aina ' +
          '24 tunnin `HH:mm` riippumatta näyttömuodosta.',
      },
    },
  },
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

let capturedConsoleErrors: string[] = [];

export const Default: Story = { tags: docExample };

export const WithValue: Story = {
  tags: docExample,
  args: { defaultValue: '09:30' },
};

export const WithHelperText: Story = {
  tags: docExample,
  args: { helperText: 'Muoto: tunnit:minuutit' },
};

export const WithError: Story = {
  tags: docExample,
  args: { error: 'Kellonaika on virheellinen', defaultValue: '09:30' },
};

export const WithMinMax: Story = {
  tags: docExample,
  args: { min: '08:00', max: '17:00', defaultValue: '09:30', helperText: 'Valittavissa 8–17' },
};

// Shows how DateField and TimeField compose: TimeField returns a plain "HH:mm"
// string while DateField returns a Date, so a consumer combining them into a
// single timestamp does so themselves — see the description below.
export const BookingFlow: Story = {
  tags: docExample,
  parameters: {
    docs: {
      description: {
        story:
          '`TimeField` palauttaa arvon merkkijonona muodossa `"HH:mm"`, kun taas `DateField` ' +
          'palauttaa `Date`-olion. Komponentit eivät yhdistä arvojaan automaattisesti — kuluttaja ' +
          'tekee sen itse, esimerkiksi: ' +
          '`dayjs(date).hour(+time.slice(0, 2)).minute(+time.slice(3))`.',
      },
    },
  },
  render: function Render(args) {
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState('');
    return (
      // flexWrap prevents the pairing from overflowing the viewport at narrow
      // widths (e.g. the 320px check in the brief) — the brief's sample style
      // omitted it, but the two fields together don't fit a 320px canvas.
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
        <DateField
          label="Valitse päivämäärä"
          calendarButtonLabel="Avaa kalenteri"
          prevMonthLabel="Edellinen kuukausi"
          nextMonthLabel="Seuraava kuukausi"
          value={date}
          onChange={setDate}
        />
        <TimeField {...args} value={time} onChange={setTime} />
      </div>
    );
  },
};

export const Uncontrolled: Story = {
  args: { defaultValue: '09:30', onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await expect(input).toHaveValue('09:30');
    // fireEvent-free: typing into a time input targets the focused segment.
    await userEvent.clear(input);
    await userEvent.type(input, '1045');
    await expect(input).toHaveValue('10:45');
    await expect(args.onChange).toHaveBeenLastCalledWith('10:45');
  },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('08:00');
    return (
      <>
        <TimeField {...args} value={value} onChange={setValue} />
        <span data-testid="echo">{value}</span>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await expect(input).toHaveValue('08:00');
    await userEvent.clear(input);
    await userEvent.type(input, '1115');
    // The parent's state, not internal state, drives the displayed value.
    await expect(canvas.getByTestId('echo')).toHaveTextContent('11:15');
  },
};

export const IsANativeTimeInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The native input is what supplies keyboard increments and spinbutton
    // semantics — if this regresses to type="text" the whole design is void.
    await expect(canvas.getByLabelText('Valitse kellonaika')).toHaveAttribute('type', 'time');
  },
};

export const AccessibleNameViaAriaLabel: Story = {
  // With no visible label, an aria-label must give the input an accessible name.
  args: { label: undefined, 'aria-label': 'Kellonaika' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Kellonaika');
    await expect(input).toHaveAccessibleName('Kellonaika');
  },
};

// When both `label` and `aria-label` are supplied, the visible label must
// win the accessible-name computation — forwarding `aria-label` unconditionally
// would let it silently override the visible label's text (WCAG 2.5.3 Label in
// Name), breaking voice-control activation by the visible label's wording.
export const VisibleLabelWinsOverAriaLabel: Story = {
  args: { 'aria-label': 'Should not win' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await expect(input).toHaveAccessibleName('Valitse kellonaika');
    await expect(input).not.toHaveAccessibleName('Should not win');
  },
};

export const WarnsWithoutAccessibleName: Story = {
  // With neither label nor aria-label/aria-labelledby, the component must
  // warn the developer in dev (the input would otherwise be unnamed).
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

export const HidesNativePickerIndicator: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    // Figma places the clock control OUTSIDE the field, so the browser's own
    // in-field indicator must not render — otherwise there are two clock icons.
    //
    // Reading getComputedStyle(input, '::-webkit-calendar-picker-indicator')
    // proved unreliable in this Chromium/Playwright combination — it reports
    // 'block' regardless of the `display: none` rule targeting that shadow
    // pseudo-element, so it cannot distinguish "rule applied" from "rule
    // absent". Assert structurally instead: the input carries the `timeInput`
    // class, which is the thing that contains the suppression rule (see
    // TimeField.css.ts). The visual result is confirmed manually in Storybook.
    await expect(input).toHaveClass(timeInput);
  },
};

export const MarksEmptySegmentsForPlaceholderStyling: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    // `data-empty` is what TimeField.css.ts keys its `--:--` placeholder
    // colouring off (Chromium's `-webkit-datetime-edit-*` shadow
    // pseudo-elements don't support `:not([attr])` matching, so this can't be
    // driven by a browser-set attribute). This only checks the attribute is
    // wired correctly — the rendered colour itself is verified visually, not
    // by a computed-style read, since that read is unreliable for these
    // pseudo-elements (see HidesNativePickerIndicator above).
    await expect(input).toHaveAttribute('data-empty', 'true');
    await userEvent.type(input, '0945');
    await expect(input).toHaveValue('09:45');
    await expect(input).not.toHaveAttribute('data-empty');
    await userEvent.clear(input);
    await expect(input).toHaveAttribute('data-empty', 'true');
  },
};

export const TriggerOpensNativePicker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika') as HTMLInputElement;
    // The picker panel is OS-level chrome Playwright cannot see into, so assert
    // the invocation rather than the rendered widget.
    const showPicker = fn();
    Object.defineProperty(input, 'showPicker', { value: showPicker, configurable: true });

    await userEvent.click(canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' }));
    await expect(showPicker).toHaveBeenCalledTimes(1);
  },
};

export const TriggerFallsBackToFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika') as HTMLInputElement;
    // Safari <16 has no showPicker, and Chromium throws NotAllowedError without
    // user activation. Either way the button must not be inert.
    Object.defineProperty(input, 'showPicker', {
      value: () => {
        throw new DOMException('not allowed', 'NotAllowedError');
      },
      configurable: true,
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' }));
    await expect(input).toHaveFocus();
  },
};

export const DisabledDisablesBothParts: Story = {
  tags: docExample,
  args: { disabled: true, defaultValue: '09:30' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Figma's one stated exception: disabling the component disables both subcomponents.
    await expect(canvas.getByLabelText('Valitse kellonaika')).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' })).toBeDisabled();
  },
};

export const ClearButtonEmptiesTheField: Story = {
  args: { defaultValue: '09:30', onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await userEvent.click(canvas.getByRole('button', { name: 'Tyhjennä kellonaika' }));
    await expect(input).toHaveValue('');
    await expect(args.onChange).toHaveBeenLastCalledWith('');
    // Task 3's empty-segment placeholder mechanism keys off this attribute —
    // clearing must flip it back to 'true', the same as a manually emptied field.
    await expect(input).toHaveAttribute('data-empty', 'true');
  },
};

// Mirrors DateField.stories.tsx's ClearButtonClearsValue: every other clear story
// here uses defaultValue (uncontrolled), which collapses the distinction between
// `currentValue`/`showClear` reading `internalValue` vs. the controlled-aware
// value — a regression there would pass all of them. This one proves the clear
// button also works, and drives the *parent's* state, in controlled mode.
export const ClearButtonClearsControlledValue: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('09:30');
    return (
      <>
        <TimeField {...args} value={value} onChange={setValue} />
        <span data-testid="echo">{value}</span>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await expect(input).toHaveValue('09:30');
    await userEvent.click(canvas.getByRole('button', { name: 'Tyhjennä kellonaika' }));
    await expect(input).toHaveValue('');
    // The parent's state, not internal state, must have emptied — toHaveTextContent('')
    // would pass vacuously (empty string is a substring match), so compare textContent directly.
    await expect(canvas.getByTestId('echo').textContent).toBe('');
    // The ✕ is removed once the field is empty; focus moves to the trigger so it
    // isn't lost to <body> when the button it sat on disappears.
    await expect(
      canvas.queryByRole('button', { name: 'Tyhjennä kellonaika' })
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' })).toHaveFocus()
    );
  },
};

export const ClearButtonHiddenWhenEmpty: Story = {
  // Nothing to clear on an empty field, so the ✕ must not be present.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('button', { name: 'Tyhjennä kellonaika' })
    ).not.toBeInTheDocument();
  },
};

export const ClearButtonHiddenWhenDisabled: Story = {
  // A disabled field can't be edited, so the clear affordance is suppressed even
  // though there is a value present.
  args: { disabled: true, defaultValue: '09:30' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('button', { name: 'Tyhjennä kellonaika' })
    ).not.toBeInTheDocument();
  },
};

export const ClearMovesFocusToTrigger: Story = {
  args: { defaultValue: '09:30' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' });
    await userEvent.click(canvas.getByRole('button', { name: 'Tyhjennä kellonaika' }));
    // The ✕ unmounts the moment the field empties, so focus would otherwise
    // fall to <body>. Same fix as DateField.handleClear.
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

// Controlled (not uncontrolled, per the plan's rulings): also proves the
// out-of-range value is still committed up to the parent — TimeField flags
// it rather than blocking entry, matching how the native input itself never
// refuses a keystroke for being out of [min, max].
export const OutOfRangeShowsError: Story = {
  args: { min: '08:00', max: '17:00' },
  render: function Render(args) {
    const [value, setValue] = useState('');
    return (
      <>
        <TimeField {...args} value={value} onChange={setValue} />
        <span data-testid="echo">{value}</span>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await userEvent.type(input, '0600');
    await waitFor(() =>
      expect(canvas.getByText('Kellonaika on sallitun välin ulkopuolella')).toBeVisible()
    );
    await expect(canvas.getByTestId('echo').textContent).toBe('06:00');
    // …and clears again once the value is back inside the range.
    await userEvent.clear(input);
    await userEvent.type(input, '0900');
    await waitFor(() =>
      expect(
        canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
      ).not.toBeInTheDocument()
    );
    await expect(canvas.getByTestId('echo').textContent).toBe('09:00');
  },
};

export const ConsumerErrorWinsOverRangeError: Story = {
  args: { min: '08:00', max: '17:00', error: 'Varaus on jo täynnä' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Valitse kellonaika'), '0600');
    await expect(canvas.getByText('Varaus on jo täynnä')).toBeVisible();
    await expect(
      canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
    ).not.toBeInTheDocument();
  },
};

export const StepIsClampedToWholeMinutes: Story = {
  args: { step: 5 },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    // A sub-60 step would make the browser render a seconds segment; the
    // component clamps it to a whole minute so only hh:mm segments exist.
    await expect(input).toHaveAttribute('step', '60');
    // The invalid sub-60 step also fires a dev-only warning naming both the
    // value that was passed and the value actually used.
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => m.includes('got 5, using 60'))).toBe(true)
    );
    // With the browser only ever seeing the clamped step, a normal
    // minute-granularity entry must not be flagged as a step mismatch.
    await userEvent.type(input, '0930');
    await expect(
      canvas.queryByText('Valitse kellonaika sallitulla tarkkuudella')
    ).not.toBeInTheDocument();
  },
};

// A step that IS >= 60 but isn't a multiple of it (e.g. 90s = 1.5min) would
// otherwise slip through a floor-only clamp unchanged, breaking the same
// "no seconds segment" contract as a sub-60 step: 90 rounds to 120, not 60.
export const StepRoundsToNearestMinuteWhenAboveSixty: Story = {
  args: { step: 90 },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    // 90s rounds to the nearer of 60/120 by whole minutes, i.e. 120.
    await expect(input).toHaveAttribute('step', '120');
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => m.includes('got 90, using 120'))).toBe(true)
    );
  },
};

// With the clamp rounding to a whole-minute multiple, `stepMismatch` becomes
// reachable (and meaningful) for a legitimate granularity like 15 minutes —
// the booking-flow case the plan calls out. This is the only story in this
// file that actually drives `stepMismatch` true/false, as distinct from the
// two stories above, which only check the clamped `step` attribute and the
// dev warning — they never assert on validity itself. It expects the
// `stepMismatch`-specific message, not the range one, since every value here
// stays inside [00:00, ∞) — only the grid is ever at issue.
//
// `min` is passed explicitly here (rather than relying on the component's
// own '00:00' default — see StepAloneEnforcesGranularityViaDefaultMin below)
// to exercise the consumer-supplied-`min` path specifically: it must behave
// identically to the defaulted path, and this is the story that would catch
// a regression that special-cased the default instead of just filling the
// same `min` prop.
export const StepMismatchFlagsOffGridValuesAtFifteenMinuteGranularity: Story = {
  args: { step: 900, min: '00:00' }, // 15 minutes; already a whole-minute multiple, so no dev warning.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await expect(input).toHaveAttribute('step', '900');
    // On the 15-minute grid (00, 15, 30, 45) — no error.
    await userEvent.type(input, '0915');
    await expect(
      canvas.queryByText('Valitse kellonaika sallitulla tarkkuudella')
    ).not.toBeInTheDocument();
    // Off the grid by 5 minutes — `stepMismatch` fires.
    await userEvent.clear(input);
    await userEvent.type(input, '0905');
    await waitFor(() =>
      expect(canvas.getByText('Valitse kellonaika sallitulla tarkkuudella')).toBeVisible()
    );
    // Back on the grid — clears again.
    await userEvent.clear(input);
    await userEvent.type(input, '0930');
    await waitFor(() =>
      expect(
        canvas.queryByText('Valitse kellonaika sallitulla tarkkuudella')
      ).not.toBeInTheDocument()
    );
  },
};

// An off-grid time inside [min, max] is not "outside the allowed range" — it is
// the wrong granularity, and the message has to say which (WCAG 3.3.3).
export const StepMismatchHasItsOwnMessage: Story = {
  args: { min: '08:00', max: '17:00', step: 900 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await userEvent.type(input, '0905'); // inside the window, off the 15-min grid
    await waitFor(() =>
      expect(canvas.getByText('Valitse kellonaika sallitulla tarkkuudella')).toBeVisible()
    );
    await expect(
      canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
    ).not.toBeInTheDocument();
    // A genuinely out-of-window value still gets the range message.
    await userEvent.clear(input);
    await userEvent.type(input, '0600');
    await waitFor(() =>
      expect(canvas.getByText('Kellonaika on sallitun välin ulkopuolella')).toBeVisible()
    );
    await expect(
      canvas.queryByText('Valitse kellonaika sallitulla tarkkuudella')
    ).not.toBeInTheDocument();
  },
};

// Chromium never evaluates `stepMismatch` on a time input without a `min`
// present (see the empirical finding documented above). Without the
// component defaulting `min` to '00:00' whenever `step` is supplied and no
// `min` was given, this story's off-grid value would be silently accepted —
// this is the exact behaviour gap the default exists to close.
export const StepAloneEnforcesGranularityViaDefaultMin: Story = {
  args: { step: 900 }, // 15 minutes, no explicit `min`.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    // The component filled in the '00:00' default so `step` actually bites.
    await expect(input).toHaveAttribute('min', '00:00');
    await userEvent.type(input, '0905'); // 5 minutes off the 15-minute grid.
    await waitFor(() =>
      expect(canvas.getByText('Valitse kellonaika sallitulla tarkkuudella')).toBeVisible()
    );
  },
};

// The one value the '00:00' default could plausibly disturb is midnight
// itself: `min` is inclusive, so `00:00 >= min('00:00')` must not read as
// rangeUnderflow, and 0 seconds past midnight is trivially on any step grid
// (0 is a multiple of everything), so `stepMismatch` must not fire either.
// Checked against both messages now that they've split, since either flag
// firing would be a regression this story exists to catch.
export const DefaultMinDoesNotFlagMidnightItself: Story = {
  args: { step: 900 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await userEvent.type(input, '0000');
    await expect(input).toHaveValue('00:00');
    await expect(
      canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Valitse kellonaika sallitulla tarkkuudella')
    ).not.toBeInTheDocument();
  },
};

// The default is purely a side effect of `step` — a field that never sets
// `step` must not gain an implicit `min` it never asked for.
export const NoStepMeansNoImplicitMin: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Valitse kellonaika')).not.toHaveAttribute('min');
  },
};

// Controlled: the parent resets `value` programmatically (a button click, not
// typing or blurring the input itself) — the stale range error must clear
// purely from the value becoming valid again, proving validation is driven
// by an effect over `currentValue` rather than only by the input's own
// change/blur events.
export const RangeErrorClearsOnProgrammaticValueReset: Story = {
  args: { min: '08:00', max: '17:00' },
  render: function Render(args) {
    const [value, setValue] = useState('06:00');
    return (
      <>
        <TimeField {...args} value={value} onChange={setValue} />
        <button onClick={() => setValue('09:00')}>Set to 09:00</button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The field mounts already out of range — the error must show without
    // any user interaction with the input at all.
    await waitFor(() =>
      expect(canvas.getByText('Kellonaika on sallitun välin ulkopuolella')).toBeVisible()
    );
    await userEvent.click(canvas.getByText('Set to 09:00'));
    await waitFor(() =>
      expect(
        canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
      ).not.toBeInTheDocument()
    );
  },
};

// Changing `min`/`max` themselves — not the value — must re-evaluate the
// already-displayed value against the new bounds.
export const RangeErrorFollowsMinMaxChanges: Story = {
  render: function Render(args) {
    const [min, setMin] = useState('08:00');
    return (
      <>
        <TimeField {...args} min={min} max="17:00" defaultValue="09:00" />
        <button onClick={() => setMin('10:00')}>Raise min to 10:00</button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 09:00 is within the initial [08:00, 17:00].
    await expect(
      canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
    ).not.toBeInTheDocument();
    // Raising `min` past the already-displayed value flags it — no
    // interaction with the input itself.
    await userEvent.click(canvas.getByText('Raise min to 10:00'));
    await waitFor(() =>
      expect(canvas.getByText('Kellonaika on sallitun välin ulkopuolella')).toBeVisible()
    );
  },
};

// Every other range story goes below `min`, which left `max` and the
// `rangeOverflow` flag deletable without a single test going red.
export const OverMaxShowsError: Story = {
  args: { min: '08:00', max: '17:00' },
  render: function Render(args) {
    const [value, setValue] = useState('');
    return (
      <>
        <TimeField {...args} value={value} onChange={setValue} />
        <span data-testid="echo">{value}</span>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await expect(input).toHaveAttribute('max', '17:00');
    await userEvent.type(input, '1930');
    await waitFor(() =>
      expect(canvas.getByText('Kellonaika on sallitun välin ulkopuolella')).toBeVisible()
    );
    // Flagged, not blocked — the same contract the underflow story asserts.
    await expect(canvas.getByTestId('echo').textContent).toBe('19:30');
    // …and clears once the value is back inside the window.
    await userEvent.clear(input);
    await userEvent.type(input, '1600');
    await waitFor(() =>
      expect(
        canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
      ).not.toBeInTheDocument()
    );
  },
};

// `max` is inclusive: the boundary value itself must not be flagged.
export const MaxBoundaryIsInclusive: Story = {
  args: { min: '08:00', max: '17:00' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await userEvent.type(input, '1700');
    await expect(input).toHaveValue('17:00');
    await expect(
      canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
    ).not.toBeInTheDocument();
  },
};

// Mirror of RangeErrorFollowsMinMaxChanges, which only ever raises `min`.
export const RangeErrorFollowsMaxChanges: Story = {
  render: function Render(args) {
    const [max, setMax] = useState('17:00');
    return (
      <>
        <TimeField {...args} min="08:00" max={max} defaultValue="16:00" />
        <button onClick={() => setMax('15:00')}>Lower max to 15:00</button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByText('Lower max to 15:00'));
    await waitFor(() =>
      expect(canvas.getByText('Kellonaika on sallitun välin ulkopuolella')).toBeVisible()
    );
  },
};

// Chromium fires NO event when the user half-fills an empty time input: the
// value stays '' and `badInput` flips silently. So this can only be caught on
// blur, which is why `revalidate` is wired to onBlur and not just to an effect
// over `currentValue`. Without that, the field shows `09:--` and reports
// nothing to anyone (WCAG 3.3.1) — the same case DateField.tsx:275-281 guards.
//
// Two driver substitutions were required, both verified empirically:
// - `@storybook/testing-library`'s `userEvent` is inert for reaching this
//   native input's `badInput` state at all (typing '09' never flips
//   `validity.badInput`), so these four stories use the Playwright-backed
//   driver from `vitest/browser` instead.
// - Even with that driver, `userEvent.tab()` does NOT blur the field: a
//   multi-segment time input treats Tab as moving between its internal
//   hour/minute segments (confirmed via `document.activeElement` staying on
//   the input after `.tab()`), not as leaving the control. A click on a
//   different focusable element is used instead to actually trigger blur.
//
// That element is the picker-trigger button, whose `onClick` calls
// `input.showPicker()` — real OS-level chrome Playwright cannot see into
// (see `TriggerOpensNativePicker`/`TriggerFallsBackToFocus` above, which
// stub it for the same reason). Stub it here too so the click still moves
// focus for real without depending on whatever headless Chromium does with
// an unmocked `showPicker()` call.
const blurTimeInput = (canvas: ReturnType<typeof within>) => {
  const input = canvas.getByLabelText('Valitse kellonaika') as HTMLInputElement;
  Object.defineProperty(input, 'showPicker', { value: () => {}, configurable: true });
  return browserUserEvent.click(canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' }));
};

export const IncompleteEntryShowsError: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await browserUserEvent.type(input, '09'); // hour only — minute left as `--`
    await blurTimeInput(canvas);
    await waitFor(() =>
      expect(canvas.getByText('Anna kellonaika muodossa tunnit:minuutit')).toBeVisible()
    );
    // The value never became a real time, so nothing was committed upward.
    await expect(args.onChange).not.toHaveBeenCalledWith(expect.stringMatching(/^\d{2}:\d{2}$/));
  },
};

// A partially-filled field is not an empty field: the typed `09` must render in
// the normal text colour, not the `--:--` placeholder grey.
export const IncompleteEntryIsNotMarkedEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await expect(input).toHaveAttribute('data-empty', 'true');
    await browserUserEvent.type(input, '09');
    await blurTimeInput(canvas);
    await waitFor(() => expect(input).not.toHaveAttribute('data-empty'));
  },
};

// Completing the time clears the incomplete error again.
export const CompletingTheTimeClearsIncompleteError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await browserUserEvent.type(input, '09');
    await blurTimeInput(canvas);
    await waitFor(() =>
      expect(canvas.getByText('Anna kellonaika muodossa tunnit:minuutit')).toBeVisible()
    );
    // Re-focus the field before typing again — blurring for the check above
    // moved focus to the picker trigger. `@storybook/testing-library`'s
    // `userEvent.clear`/`type` reliably resets focus to the first (hour)
    // segment here, where `browserUserEvent`'s click-then-type left focus on
    // whichever segment its default click position happened to hit (verified
    // empirically) — so this one step reverts to the other driver.
    await userEvent.clear(input);
    await userEvent.type(input, '0930');
    await expect(input).toHaveValue('09:30');
    await waitFor(() =>
      expect(canvas.queryByText('Anna kellonaika muodossa tunnit:minuutit')).not.toBeInTheDocument()
    );
  },
};

// A consumer-supplied error still outranks the internal incomplete message —
// and, distinctly, `incomplete` is still genuinely computed underneath it
// rather than never evaluated at all. `error` is toggleable via a button
// rather than a fixed arg so the story can prove both halves: with `error` a
// naive/absent `incomplete` computation would pass this identically (the
// consumer error masks it either way), but once `error` is cleared, the
// incomplete message must appear — which only happens if `revalidate` really
// set `validity.incomplete` while `error` was still masking it.
export const ConsumerErrorWinsOverIncompleteError: Story = {
  render: function Render(args) {
    const [error, setError] = useState<string | undefined>('Varaus on jo täynnä');
    return (
      <>
        <TimeField {...args} error={error} />
        <button onClick={() => setError(undefined)}>Clear consumer error</button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await browserUserEvent.type(canvas.getByLabelText('Valitse kellonaika'), '09');
    await blurTimeInput(canvas);
    // Both are live: the consumer error wins.
    await expect(canvas.getByText('Varaus on jo täynnä')).toBeVisible();
    await expect(
      canvas.queryByText('Anna kellonaika muodossa tunnit:minuutit')
    ).not.toBeInTheDocument();
    // Clearing the consumer error reveals the incomplete message underneath.
    await userEvent.click(canvas.getByRole('button', { name: 'Clear consumer error' }));
    await waitFor(() =>
      expect(canvas.getByText('Anna kellonaika muodossa tunnit:minuutit')).toBeVisible()
    );
  },
};

// A malformed value is rejected outright by the native input, which leaves the
// field visually empty while the consumer's state still holds their string —
// so the only signal that anything is wrong has to come from us. A malformed
// `min` is worse: the browser ignores the attribute, silently disabling both
// the range check and (because the '00:00' fallback no longer fires) step
// enforcement. Same hazard DateField.tsx:188-202 guards.
export const WarnsOnMalformedTimeStrings: Story = {
  args: { value: '9:30', min: '25:00', onChange: fn() },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The native input really does discard it — this is what the warning is for.
    await expect(canvas.getByLabelText('Valitse kellonaika')).toHaveValue('');
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => m.includes('`value` must be "HH:mm"'))).toBe(true)
    );
    await expect(capturedConsoleErrors.some((m) => m.includes('`min` must be "HH:mm"'))).toBe(true);
  },
};

// The guard must stay quiet for well-formed values, including the empty string,
// or it would cry wolf on every correctly-used field.
export const DoesNotWarnOnWellFormedTimeStrings: Story = {
  args: { value: '', min: '00:00', max: '23:59', step: 900, onChange: fn() },
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
    await waitFor(() => expect(capturedConsoleErrors.some((m) => m.includes('HH:mm'))).toBe(false));
  },
};
