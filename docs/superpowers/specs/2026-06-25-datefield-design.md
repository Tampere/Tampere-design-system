# DateField Component Design

**Issue:** #52 — Implement DateField component (Päivämääräkenttä)  
**Date:** 2026-06-25  
**Status:** Approved

---

## Overview

`DateField` is a typeable date text field with a custom calendar popover. It is built on top of the TREDS `TextField` component, Mantine `Popover`, and Mantine `Calendar` from `@mantine/dates`. It follows pick-then-confirm semantics: typing commits immediately, while the calendar requires the user to click *Valitse* to apply a selection.

---

## New Dependency

`@mantine/dates` must be added as a **peer dependency** (alongside the existing `@mantine/core` peer dep). Consumers must install it explicitly. The README install instructions should document this.

`@mantine/dates` uses `dayjs` internally. Finnish locale is activated via a one-line side-effect import: `import 'dayjs/locale/fi'`.

---

## File Structure

```
src/components/DateField/
  DateField.tsx           — text field + popover wiring, owns all state
  DateFieldCalendar.tsx   — popover content: header + grid + footer
  DateField.css.ts        — all Vanilla Extract styles
  DateField.stories.tsx   — Storybook stories (serve as browser tests)
  index.ts                — re-export
```

---

## Component API

```typescript
interface DateFieldProps {
  // Value
  value?: Date | null;
  onChange?: (date: Date | null) => void;

  // Field labels
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;          // default: "PP.KK.VVVV"

  // Constraints
  min?: Date;
  max?: Date;

  // State
  disabled?: boolean;
  required?: boolean;

  // Localised button/aria labels
  calendarButtonLabel: string;   // required — icon-only button, no safe default
  prevMonthLabel: string;        // required — icon-only button, no safe default
  nextMonthLabel: string;        // required — icon-only button, no safe default
  todayLabel?: string;           // default: "Tänään"
  cancelLabel?: string;          // default: "Peruuta"
  confirmLabel?: string;         // default: "Valitse"

  // Escape hatch
  classNames?: Partial<DateFieldClassNames>; // keys: root, input, calendar, header, footer
}
```

`calendarButtonLabel`, `prevMonthLabel`, and `nextMonthLabel` are required (no string default) because they are icon-only buttons — screen readers must have a meaningful label and the consumer owns the language. `todayLabel`/`cancelLabel`/`confirmLabel` default to Finnish since TREDS targets Finnish city services.

---

## State Model

`DateField.tsx` owns four pieces of state:

| State | Type | Purpose |
|---|---|---|
| `committedDate` | `Date \| null` | The real value — updated by typing a valid date or clicking *Valitse* |
| `textValue` | `string` | Raw text in the input — may be partially typed or invalid |
| `stagedDate` | `Date \| null` | Date highlighted in the calendar, not yet confirmed |
| `calendarMonth` | `Date` | Which month the calendar is currently showing |

### Two commit paths

**Typing:** On every keystroke, attempt `dayjs(text, 'DD.MM.YYYY', true)` (strict mode). If the result is valid and within min/max, update `committedDate` and call `onChange` immediately. On blur, if `textValue` doesn't parse as a valid date, reset it to the formatted `committedDate` (or empty string if null).

**Calendar:** On popover open, initialise `stagedDate` and `calendarMonth` to `committedDate` (or today if null). Clicking a day updates `stagedDate` only — `onChange` is not called. Button actions:
- *Valitse* — copies `stagedDate` → `committedDate`, calls `onChange`, closes popover
- *Peruuta* — closes popover, discards `stagedDate`
- *Tänään* — sets `stagedDate` to today, navigates `calendarMonth` to today's month

`DateFieldCalendar` never writes to `committedDate` directly — it receives `stagedDate` and `calendarMonth` as props and fires callbacks.

---

## Sub-component Internals

### `DateField.tsx`

- Renders TREDS `TextField` with `endInstance` set to a `CalendarIcon` `IconButton`
- Wraps in Mantine `Popover` with `trapFocus` and `returnFocus`
- Text parsing via `dayjs(text, 'DD.MM.YYYY', true)` — strict flag prevents partial strings from silently parsing
- `TextField` receives `aria-haspopup="dialog"` and `aria-expanded={isOpen}`

### `DateFieldCalendar.tsx`

Props: `stagedDate`, `calendarMonth`, `onMonthChange`, `onStagedDateChange`, `onConfirm`, `onCancel`, `onToday`, `min`, `max`, and all label props.

Three visual sections:

**Header**
- Two native `<select>` elements: month (Finnish names array, 12 options) and year (default range: 100 years before today to 20 years after today, clamped to `min`/`max` if provided)
- Prev/next `IconButton`s using TREDS `ChevronLeftIcon` / `ChevronRightIcon`
- Changing either select or clicking prev/next updates `calendarMonth` only

**Grid**
- Mantine `Calendar` with `locale="fi"`, `firstDayOfWeek={1}`, `date={calendarMonth}`, `level="month"`
- `level="month"` locks the grid to month view — prevents the user from clicking the header label to activate year/decade level-switching (navigation is owned entirely by the header dropdowns)
- Day cell states via `getDayProps`: staged = filled blue, today = underline marker, outside min/max = greyed + `disabled`, adjacent-month days = muted opacity
- All colours use TREDS `vars` tokens

**Footer**
- Three TREDS `Button`s: *Tänään* (`variant="text"`), *Peruuta* (`variant="outlined"`), *Valitse* (`variant="filled"`)
- Laid out with `justifyContent: space-between`

### `DateField.css.ts`

Covers: popover container, calendar header layout, styled native `<select>` (border, font, padding matching TREDS input tokens), day cell overrides via `globalStyle` scoped inside the popover container, and footer layout.

---

## Accessibility

- **Popover:** `role="dialog"` with `aria-label`, `trapFocus`, `returnFocus` to calendar `IconButton`
- **Calendar grid:** Mantine `Calendar` renders `role="grid"` / `role="gridcell"` with arrow-key navigation out of the box. Each day cell gets a locale-aware `aria-label` (e.g. "maanantai 1. tammikuuta 2025"). Disabled cells get `aria-disabled="true"`.
- **Icon buttons:** All icon-only buttons pass `aria-label` through TREDS `IconButton`. The three required prop types (`calendarButtonLabel`, `prevMonthLabel`, `nextMonthLabel`) enforce labels at the type level.
- **Text field:** `aria-haspopup="dialog"` and `aria-expanded={isOpen}`. Mantine's `TextInput` wires `aria-describedby` to the error message automatically.
- **Live region:** A visually hidden `aria-live="polite"` region announces the staged date when a day is clicked, so screen reader users know what they have selected before confirming.
- **Target:** WCAG 2.1 AA (Finnish Act 306/2019)

---

## Responsive behaviour

The Vanilla Extract theme contract (`vars`) updates CSS custom properties at each of the six TREDS breakpoints (320 / 480 / 768 / 1024 / 1440 / 1920) via media queries in `theme.css.ts`. The `DateField` consumes `vars` tokens for typography and spacing so it responds automatically without any JS breakpoint logic.

The popover calendar width is set to a fixed value that works across all breakpoints; on small viewports it may need to be positioned carefully (Mantine `Popover` handles collision detection via Floating UI).

---

## Testing

Stories in `DateField.stories.tsx` serve as both Storybook documentation and Vitest browser tests (via `@storybook/addon-vitest`). The a11y addon runs on every story automatically.

### Render stories

| Story | Purpose |
|---|---|
| `Default` | Empty field, no value |
| `WithValue` | Pre-populated with a `Date` |
| `Disabled` | Full disabled state |
| `WithError` | Error message shown |
| `WithHelperText` | Helper text below field |
| `WithMinMax` | Days outside range greyed and unclickable |

### Interaction tests (`play` functions)

- Open calendar via icon button → popover visible, focus trapped
- Navigate months via prev/next → calendar month changes
- Change year/month via dropdowns → calendar navigates correctly
- Click a day → staged (highlighted), `onChange` not called
- Click *Valitse* → `onChange` called with correct `Date`, popover closes
- Click *Peruuta* → `onChange` not called, popover closes, staged date discarded
- Click *Tänään* → calendar navigates to today, today staged
- Type a valid `DD.MM.YYYY` → `onChange` called immediately
- Type an invalid string and blur → field resets to last committed value
- Type a date outside min/max → treated as invalid, `onChange` not called

---

## Exports

`DateField` is exported from `src/components/index.tsx` and therefore from `src/index.ts` (the package entry point). The `DateFieldProps` type is also exported.

---

## Out of scope

- Time picker (handled separately by issue #53 — TimeField)
- Date range picker
- Inline (non-popover) calendar variant
- Multiple locale support beyond Finnish defaults
