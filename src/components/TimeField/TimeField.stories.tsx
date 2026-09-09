import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { userEvent as browserUserEvent } from 'vitest/browser';
import { expect, fn } from 'storybook/test';
import { TimeField } from './TimeField';
import { timeInput } from './TimeField.css';
import { DateField } from '../DateField';
import { vars } from '../../theme';

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
      // flexWrap prevents the pairing from overflowing at narrow widths — the
      // two fields together don't fit a 320px canvas.
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: vars.primitives.spacing['3'],
          alignItems: 'flex-start',
        }}
      >
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
    // The increments themselves are asserted in KeyboardArrowsIncrementByStep.
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
    // The empty-segment placeholder mechanism (#53) keys off this attribute —
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

// The other side of ClearButtonClearsControlledValue: a controlled consumer that
// ignores `onChange` keeps the value, so the ✕ stays and the clear did nothing
// visible. Moving focus to the trigger anyway would be the visible half of an
// action that had no effect — and unlike the uncontrolled case, there is no
// re-render to notice, so the component has to check the value itself.
export const IgnoredControlledClearLeavesFocusAlone: Story = {
  args: { value: '09:30', onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const clearButton = canvas.getByRole('button', { name: 'Tyhjennä kellonaika' });
    await userEvent.click(clearButton);
    await expect(args.onChange).toHaveBeenLastCalledWith('');
    // The parent ignored the call, so the value — and with it the ✕ — is unchanged.
    await expect(canvas.getByLabelText('Valitse kellonaika')).toHaveValue('09:30');
    await expect(clearButton).toBeInTheDocument();
    // Give an (incorrect) deferred focus move a chance to happen, then assert
    // that focus is still on the ✕ the user actually clicked.
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect(clearButton).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Avaa kellonaikavalitsin' })).not.toHaveFocus();
  },
};

// Controlled (not uncontrolled): also proves the
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

// `stepMinutes` is in minutes, so the DOM attribute is always 60x the prop —
// this is the story that pins the unit conversion. Zero (or any value below a
// minute) would mean "no granularity at all" to the browser, so it clamps to
// one minute and says so.
export const StepMinutesBelowOneIsClampedToOneMinute: Story = {
  args: { stepMinutes: 0 },
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
    await expect(input).toHaveAttribute('step', '60');
    // The dev-only warning names both the value that was passed and the value
    // actually used, in the prop's own unit.
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => m.includes('got 0, using 1'))).toBe(true)
    );
  },
};

// A fractional step would make the browser render a seconds segment, which this
// component does not support: 1.5 minutes rounds to 2 (=120s), not down to 1.
export const FractionalStepMinutesRoundsToAWholeMinute: Story = {
  args: { stepMinutes: 1.5 },
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
    await expect(input).toHaveAttribute('step', '120');
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => m.includes('got 1.5, using 2'))).toBe(true)
    );
  },
};

// `Math.round(NaN)` is NaN and `Math.max(1, NaN)` is NaN, so without the
// `Number.isFinite` guard this put `step="NaN"` in the DOM and warned the
// self-contradictory "got NaN, using NaN".
export const NaNStepMinutesFallsBackToOneMinute: Story = {
  args: { stepMinutes: NaN },
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
    await expect(input).toHaveAttribute('step', '60');
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => m.includes('got NaN, using 1'))).toBe(true)
    );
  },
};

// The other half of the same guard, and the one that used to fail silently:
// Infinity survived `Math.max`/`Math.round` unchanged, so it compared equal to
// itself and produced no warning at all on its way into the DOM.
export const InfiniteStepMinutesFallsBackToOneMinute: Story = {
  args: { stepMinutes: Infinity },
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
    await expect(input).toHaveAttribute('step', '60');
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => m.includes('got Infinity, using 1'))).toBe(true)
    );
  },
};

// `stepMismatch` is reachable (and meaningful) for a legitimate granularity
// like 15 minutes — the booking-flow case #53 calls out. This is the only story
// in this file that actually drives `stepMismatch` true/false, as distinct from
// the four clamping stories above, which only check the emitted `step` attribute
// and the dev warning — they never assert on validity itself. It expects the
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
  args: { stepMinutes: 15, min: '00:00' }, // Already a whole number of minutes, so no dev warning.
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
  args: { min: '08:00', max: '17:00', stepMinutes: 15 },
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

// This story asserts the '00:00' default is applied; it types its value, so it
// would be flagged even without the default. The story that fails when the
// default is removed is OffGridControlledValueIsFlaggedAtMount.
export const StepAloneEnforcesGranularityViaDefaultMin: Story = {
  args: { stepMinutes: 15 }, // No explicit `min`.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    // The component filled in the '00:00' default so the step grid actually bites.
    await expect(input).toHaveAttribute('min', '00:00');
    await userEvent.type(input, '0905'); // 5 minutes off the 15-minute grid.
    await waitFor(() =>
      expect(canvas.getByText('Valitse kellonaika sallitulla tarkkuudella')).toBeVisible()
    );
  },
};

// The counterfactual for the `min: '00:00'` default. Without an explicit `min`,
// the step base falls back to the `value` content attribute, which React keeps
// in sync with this value on every commit — so `stepMismatch` can never be true
// no matter what off-grid value is mounted. The injected `min` is what makes
// `stepMismatch` observable at all: measured, no `min` → false, `min="00:00"` →
// true for the same off-grid value. Deleting `effectiveMin` makes this story
// red, which StepAloneEnforcesGranularityViaDefaultMin does not (it only
// asserts the attribute is there, not that it is doing anything).
export const OffGridControlledValueIsFlaggedAtMount: Story = {
  args: { value: '09:05', stepMinutes: 15, onChange: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // No typing, no clicking — the value came straight from the prop.
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
  args: { stepMinutes: 15 },
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

// The default is purely a side effect of `stepMinutes` — a field that never sets
// it must not gain an implicit `min` it never asked for.
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

// A swapped pair leaves the browser with no satisfiable window — every value is
// either below `min` or above `max`, so the field rejects everything, including
// the window the consumer meant, with nothing pointing at the swapped props.
// Order the bounds instead (same normalisation as DateField.tsx) and warn.
export const SwappedMinMaxIsNormalised: Story = {
  args: { min: '17:00', max: '08:00', defaultValue: '09:30' },
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
    await expect(input).toHaveAttribute('min', '08:00');
    await expect(input).toHaveAttribute('max', '17:00');
    // 09:30 is inside the window the consumer meant, so it must not be flagged.
    await expect(
      canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
    ).not.toBeInTheDocument();
    // The normalised window is still enforced — dropping both bounds would also
    // clear the error above, so this is what distinguishes the two fixes.
    await userEvent.clear(input);
    await userEvent.type(input, '0700');
    await waitFor(() =>
      expect(canvas.getByText('Kellonaika on sallitun välin ulkopuolella')).toBeVisible()
    );
    await expect(capturedConsoleErrors.some((m) => m.includes('is after `max`'))).toBe(true);
  },
};

// The normalisation compares strings, which is only a time comparison for
// well-formed "HH:mm". The malformed `max` here is a truncated "08:0", which
// does sort below a valid "09:00" — so an unguarded comparison would swap the
// pair, inventing a 09:00 upper bound the consumer never set and throwing away
// the lower bound they did set (the browser ignores the unparseable one). Note
// that a merely non-padded bound like "1:00" would not reach this: it sorts
// *above* "09:00", since '1' > '0'. Bounds it can't parse are left alone.
export const MalformedBoundIsNotSwapped: Story = {
  args: { min: '09:00', max: '08:0', defaultValue: '10:00' },
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
    await expect(input).toHaveAttribute('min', '09:00');
    await expect(input).toHaveAttribute('max', '08:0');
    // 10:00 is above the real `min` and the malformed `max` is ignored by the
    // browser, so nothing is out of range; a bogus swap would flag it.
    await expect(
      canvas.queryByText('Kellonaika on sallitun välin ulkopuolella')
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => m.includes('`max` must be "HH:mm"'))).toBe(true)
    );
    await expect(capturedConsoleErrors.some((m) => m.includes('is after `max`'))).toBe(false);
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
    // The entry never became a real time, so nothing was committed upward at all.
    await expect(args.onChange).not.toHaveBeenCalled();
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
  args: { value: '', min: '00:00', max: '23:59', stepMinutes: 15, onChange: fn() },
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
    await expect(capturedConsoleErrors.some((m) => m.includes('HH:mm'))).toBe(false);
  },
};

// Issue #53 requires keyboard increments. The native input provides them, but
// nothing asserted it — and the arrows are also the only place the `stepMinutes`
// grid is observable as *behaviour* rather than as an attribute.
export const KeyboardArrowsIncrementByStep: Story = {
  args: { defaultValue: '09:00', stepMinutes: 15, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika') as HTMLInputElement;
    await browserUserEvent.click(input);
    // Focus lands on the hour segment; ArrowUp steps the hour by one.
    await browserUserEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('10:00');
    await expect(args.onChange).toHaveBeenLastCalledWith('10:00');
    // Move to the minute segment: ArrowUp there steps by `stepMinutes`, not by 1.
    await browserUserEvent.keyboard('{ArrowRight}{ArrowUp}');
    await expect(input).toHaveValue('10:15');
    await expect(args.onChange).toHaveBeenLastCalledWith('10:15');
    // Every value handed upward is still "HH:mm".
    for (const call of (args.onChange as ReturnType<typeof fn>).mock.calls) {
      await expect(call[0]).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    }
  },
};

// ArrowDown must step back down and stay on the grid.
export const KeyboardArrowsDecrementByStep: Story = {
  args: { defaultValue: '10:15', stepMinutes: 15, onChange: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika') as HTMLInputElement;
    await browserUserEvent.click(input);
    await browserUserEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(input).toHaveValue('10:00');
  },
};

// Without `name` the field contributes nothing to a native form submission,
// and the closed prop set leaves no way to reach the input from outside.
export const SubmitsUnderItsName: Story = {
  args: { name: 'appointmentTime', defaultValue: '09:30' },
  render: function Render(args) {
    const [submitted, setSubmitted] = useState('');
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get('appointmentTime')));
        }}
      >
        <TimeField {...args} />
        <button type="submit">Lähetä</button>
        <span data-testid="submitted">{submitted}</span>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Valitse kellonaika')).toHaveAttribute(
      'name',
      'appointmentTime'
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Lähetä' }));
    await waitFor(() => expect(canvas.getByTestId('submitted').textContent).toBe('09:30'));
  },
};

// A consumer `onBlur` must run without displacing the internal revalidation
// that the incomplete-entry check depends on.
//
// Uses `browserUserEvent`/`blurTimeInput` rather than plain
// `userEvent.type` + `.tab()`: per the comment above `blurTimeInput`, the
// `@storybook/testing-library` driver is inert for reaching `badInput` on
// this native input, and `.tab()` moves between the input's own hour/minute
// segments instead of leaving the control — same empirical constraints
// IncompleteEntryShowsError et al. already work around.
export const ConsumerBlurRunsAlongsideRevalidation: Story = {
  args: { onBlur: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Valitse kellonaika');
    await browserUserEvent.type(input, '09'); // incomplete on purpose
    await blurTimeInput(canvas);
    await expect(args.onBlur).toHaveBeenCalledTimes(1);
    // The internal revalidation still ran: the incomplete error is showing.
    await waitFor(() =>
      expect(canvas.getByText('Anna kellonaika muodossa tunnit:minuutit')).toBeVisible()
    );
  },
};

// An explicit `id` must reach the input so an external <label> can target it.
export const AcceptsAnExplicitId: Story = {
  args: { id: 'booking-time', label: undefined, 'aria-label': 'Kellonaika' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Kellonaika')).toHaveAttribute('id', 'booking-time');
  },
};
