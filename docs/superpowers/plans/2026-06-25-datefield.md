# DateField Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `DateField` component — a typeable DD.MM.YYYY text field with a pick-then-confirm calendar popover matching the Figma design (Päivämääräkenttä, issue #52).

**Architecture:** `DateField.tsx` owns all state (`committedDate`, `textValue`, `stagedDate`, `calendarMonth`) and wires a TREDS `TextField` to a Mantine `Popover`. `DateFieldCalendar.tsx` is a presentational subcomponent receiving state via props and firing callbacks — it never commits the value directly. All styles live in `DateField.css.ts` using Vanilla Extract with `vars` tokens.

**Tech Stack:** React 19, TypeScript, `@mantine/core` v8, `@mantine/dates` v8, `@vanilla-extract/css`, `dayjs` with `customParseFormat` plugin, Vitest + Storybook browser tests via Playwright.

## Global Constraints

- All styling via `@vanilla-extract/css` using `vars` from `../../theme` — no inline styles, no CSS modules
- Finnish locale: `locale="fi"`, `firstDayOfWeek={1}` on Mantine `Calendar`; Finnish month names array for the `<select>` header
- dayjs strict mode for text parsing: `dayjs(text, 'DD.MM.YYYY', true)` — requires `customParseFormat` plugin
- Value type exposed to consumers: `Date | null`
- Nav arrows use `ChevronUpIcon` (previous month) and `ChevronDownIcon` (next month) — not left/right
- Calendar icon button uses `CalendarIcon` from `../../icons/CalendarIcon`
- Import CSS files from Vanilla Extract modules with explicit `.ts` extension: `'./DateField.css.ts'`
- `npm test` runs Vitest browser tests via Playwright/Chromium — requires Storybook stories as test vehicle
- `npm run build` = `rollup -c` — must succeed without errors before PR
- Conventional commit format: `feat(#52): ...`
- Branch: `feat/52-datefield`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/components/DateField/DateField.tsx` | Main component: state, text parsing, popover wiring |
| Create | `src/components/DateField/DateFieldCalendar.tsx` | Popover content: header + grid + footer |
| Create | `src/components/DateField/DateField.css.ts` | All Vanilla Extract styles |
| Create | `src/components/DateField/DateField.stories.tsx` | Stories + play-function interaction tests |
| Create | `src/components/DateField/index.ts` | Re-export |
| Modify | `src/components/index.tsx` | Add `DateField` to barrel |
| Modify | `package.json` | Add `@mantine/dates` to peer + dev deps |
| Modify | `README.md` | Document new peer dep |

---

### Task 1: Add @mantine/dates peer dependency

**Files:**
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- Produces: `@mantine/dates` and `dayjs` importable in all subsequent tasks

- [ ] **Step 1: Add to package.json peerDependencies and devDependencies**

In `package.json`, insert `"@mantine/dates": "^8.3.8"` in both sections:

```json
"peerDependencies": {
  "@fontsource/montserrat": "^5.2.8",
  "@fontsource/open-sans": "^5.2.7",
  "@mantine/core": "^8.3.8",
  "@mantine/dates": "^8.3.8",
  "@mantine/hooks": "^8.3.8",
  "@mantine/vanilla-extract": "^8.3.8",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
},
```

Add the same line to `devDependencies` (alongside the other `@mantine/*` dev deps).

- [ ] **Step 2: Install**

```bash
npm install
```

Expected: exits 0, `node_modules/@mantine/dates` exists, `dayjs` is available (installed as a dep of `@mantine/dates`).

- [ ] **Step 3: Verify dayjs strict parsing works**

```bash
node --input-type=module <<'EOF'
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);
console.log(dayjs('16.08.2025', 'DD.MM.YYYY', true).isValid()); // true
console.log(dayjs('16.08', 'DD.MM.YYYY', true).isValid());      // false
console.log(dayjs('bad', 'DD.MM.YYYY', true).isValid());         // false
EOF
```

Expected output:
```
true
false
false
```

- [ ] **Step 4: Update README**

In `README.md`, find the line:

```
Peer dependencies (`@mantine/core`, `@fontsource/montserrat`, `@fontsource/open-sans`) are installed automatically with npm v7+.
```

Replace it (both occurrences — under "Setup with NPM-package" and "Setup without NPM-package") with:

```
Peer dependencies (`@mantine/core`, `@mantine/dates`, `@fontsource/montserrat`, `@fontsource/open-sans`) are installed automatically with npm v7+.
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json README.md
git commit -m "feat(#52): add @mantine/dates peer dependency for DateField"
```

---

### Task 2: Scaffold types and file structure

**Files:**
- Create: `src/components/DateField/index.ts`
- Create: `src/components/DateField/DateField.css.ts`
- Create: `src/components/DateField/DateFieldCalendar.tsx`
- Create: `src/components/DateField/DateField.tsx`
- Create: `src/components/DateField/DateField.stories.tsx`
- Modify: `src/components/index.tsx`

**Interfaces:**
- Produces: `DateFieldProps`, `DateFieldClassNames`, `DateFieldCalendarProps` — exact shapes used in every subsequent task

- [ ] **Step 1: Create `src/components/DateField/index.ts`**

```typescript
export { DateField, type DateFieldProps, type DateFieldClassNames } from './DateField';
```

- [ ] **Step 2: Create `src/components/DateField/DateField.css.ts`**

```typescript
// Styles populated in Task 3
export {};
```

- [ ] **Step 3: Create `src/components/DateField/DateFieldCalendar.tsx`**

```typescript
export interface DateFieldCalendarProps {
  stagedDate: Date | null;
  calendarMonth: Date;
  onMonthChange: (month: Date) => void;
  onStagedDateChange: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onToday: () => void;
  min?: Date;
  max?: Date;
  prevMonthLabel: string;
  nextMonthLabel: string;
  todayLabel: string;
  cancelLabel: string;
  confirmLabel: string;
}

export function DateFieldCalendar(_props: DateFieldCalendarProps) {
  return <div data-testid="date-field-calendar" />;
}
```

- [ ] **Step 4: Create `src/components/DateField/DateField.tsx`**

```typescript
export interface DateFieldClassNames {
  root: string;
  input: string;
  calendar: string;
  header: string;
  footer: string;
}

export interface DateFieldProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  required?: boolean;
  calendarButtonLabel: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  todayLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  classNames?: Partial<DateFieldClassNames>;
}

export function DateField(_props: DateFieldProps) {
  return <div data-testid="date-field" />;
}
```

- [ ] **Step 5: Create `src/components/DateField/DateField.stories.tsx`**

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateField } from './DateField';

const meta = {
  component: DateField,
  args: {
    calendarButtonLabel: 'Avaa kalenteri',
    prevMonthLabel: 'Edellinen kuukausi',
    nextMonthLabel: 'Seuraava kuukausi',
    label: 'Otsake',
    placeholder: 'PP.KK.VVVV',
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

- [ ] **Step 6: Add DateField to `src/components/index.tsx`**

Append to the end of `src/components/index.tsx`:

```typescript
export { DateField, type DateFieldProps, type DateFieldClassNames } from './DateField';
```

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/DateField/ src/components/index.tsx
git commit -m "feat(#52): scaffold DateField types and file structure"
```

---

### Task 3: DateField.css.ts — Vanilla Extract styles

**Files:**
- Modify: `src/components/DateField/DateField.css.ts`

**Interfaces:**
- Consumes: `vars` from `../../theme` (all tokens available on `vars.core`, `vars.components.input`, `vars.font`, `vars.text`, `vars.focusRing`)
- Produces (exported names used verbatim in Tasks 4 and 5):
  - `popoverContent` — popover dropdown container
  - `calendarHeader` — flex row for year/month selects + nav buttons
  - `calendarHeaderSelects` — flex group for the two `<select>` elements
  - `nativeSelect` — styled native `<select>`
  - `calendarGrid` — wrapper around Mantine `Calendar`; used to scope `globalStyle` selectors
  - `dayCellStaged` — applied to the staged (highlighted) day
  - `dayCellToday` — applied to today's date when not staged
  - `dayCellOutsideMonth` — applied to days outside the current month
  - `dayCellDisabled` — applied to disabled days (outside min/max)
  - `calendarFooter` — flex row for footer buttons
  - `visuallyHidden` — sr-only live region

- [ ] **Step 1: Replace DateField.css.ts with full styles**

```typescript
import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  core,
  font,
  components: { input: inputVars },
  text,
  focusRing,
} = vars;

export const popoverContent = style({
  background: core.background,
  border: `${core.strokeWeight} solid ${core.divider}`,
  boxShadow: `0 4px 12px ${core.dropshadow}`,
  padding: inputVars.padding.vertical,
  minWidth: '280px',
});

export const calendarHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: inputVars.spacing.horizontalSpacing,
  marginBottom: inputVars.spacing.verticalSpacing,
});

export const calendarHeaderSelects = style({
  display: 'flex',
  gap: inputVars.spacing.horizontalSpacing,
  flex: '1',
});

export const nativeSelect = style({
  border: `${core.strokeWeight} solid ${core.states.default}`,
  background: core.background,
  color: text.primary,
  fontSize: inputVars.font.text.fontSize,
  lineHeight: inputVars.font.text.lineHeight,
  letterSpacing: font.letterSpacing,
  padding: `${inputVars.padding.vertical} ${inputVars.padding.horizontal}`,
  cursor: 'pointer',
  selectors: {
    '&:hover': { border: `${core.strokeWeight} solid ${core.states.hover}` },
    '&:focus-visible': { ...focusRing },
    '&:disabled': {
      border: `${core.strokeWeight} solid ${core.states.disabled}`,
      color: text.disabled,
      background: core.backgroundDisabled,
      cursor: 'default',
    },
  },
});

// Wrapper around Mantine Calendar — used to scope globalStyles below
export const calendarGrid = style({});

globalStyle(`${calendarGrid} table button`, {
  borderRadius: 0,
  width: '40px',
  height: '40px',
});

globalStyle(`${calendarGrid} table button:focus-visible`, {
  ...focusRing,
});

export const dayCellStaged = style({
  background: `${core.states.default} !important`,
  color: `${core.contrast} !important`,
});

export const dayCellToday = style({
  outline: `${core.strokeWeight} solid ${core.states.default}`,
  outlineOffset: '-2px',
});

export const dayCellOutsideMonth = style({
  opacity: '0.35',
});

export const dayCellDisabled = style({
  color: `${text.disabled} !important`,
  cursor: 'default !important',
  pointerEvents: 'none',
});

export const calendarFooter = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: inputVars.spacing.verticalSpacing,
  gap: inputVars.spacing.horizontalSpacing,
});

export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
});
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/DateField/DateField.css.ts
git commit -m "feat(#52): add DateField Vanilla Extract styles"
```

---

### Task 4: DateFieldCalendar component

**Files:**
- Modify: `src/components/DateField/DateFieldCalendar.tsx`
- Modify: `src/components/DateField/DateField.stories.tsx`

**Interfaces:**
- Consumes: `DateFieldCalendarProps` (Task 2 — same interface, same prop names)
- Consumes CSS from Task 3: `calendarHeader`, `calendarHeaderSelects`, `nativeSelect`, `calendarGrid`, `dayCellStaged`, `dayCellToday`, `dayCellOutsideMonth`, `dayCellDisabled`, `calendarFooter`
- Consumes: `Button` from `'../Button'`, `IconButton` from `'../IconButton'`
- Consumes: `ChevronUpIcon` from `'../../icons/ChevronUpIcon'`, `ChevronDownIcon` from `'../../icons/ChevronDownIcon'`
- Consumes: `Calendar` from `'@mantine/dates'`
- Produces: `DateFieldCalendar` — used by `DateField` in Task 5

- [ ] **Step 1: Write the failing story to define the test contract**

Add to `DateField.stories.tsx` (after the `Default` story):

```typescript
import React from 'react';
import { within, userEvent, expect } from '@storybook/test';

export const CalendarOpens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await expect(canvas.getByTestId('date-field-calendar')).toBeInTheDocument();
  },
};
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npm test 2>&1 | grep -A 5 "CalendarOpens"
```

Expected: test fails — stub `DateField` has no calendar button.

- [ ] **Step 3: Implement DateFieldCalendar**

Replace `src/components/DateField/DateFieldCalendar.tsx` with:

```typescript
import { Calendar } from '@mantine/dates';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';
import 'dayjs/locale/fi';
import cx from 'clsx';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { ChevronUpIcon } from '../../icons/ChevronUpIcon';
import { ChevronDownIcon } from '../../icons/ChevronDownIcon';
import {
  calendarHeader,
  calendarHeaderSelects,
  calendarFooter,
  calendarGrid,
  dayCellStaged,
  dayCellToday,
  dayCellOutsideMonth,
  dayCellDisabled,
  nativeSelect,
} from './DateField.css.ts';

const FINNISH_MONTHS = [
  'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu',
  'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu',
  'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu',
];

function getYearRange(min?: Date, max?: Date): number[] {
  const today = new Date();
  const start = min ? min.getFullYear() : today.getFullYear() - 100;
  const end = max ? max.getFullYear() : today.getFullYear() + 20;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export interface DateFieldCalendarProps {
  stagedDate: Date | null;
  calendarMonth: Date;
  onMonthChange: (month: Date) => void;
  onStagedDateChange: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onToday: () => void;
  min?: Date;
  max?: Date;
  prevMonthLabel: string;
  nextMonthLabel: string;
  todayLabel: string;
  cancelLabel: string;
  confirmLabel: string;
}

export function DateFieldCalendar({
  stagedDate,
  calendarMonth,
  onMonthChange,
  onStagedDateChange,
  onConfirm,
  onCancel,
  onToday,
  min,
  max,
  prevMonthLabel,
  nextMonthLabel,
  todayLabel,
  cancelLabel,
  confirmLabel,
}: DateFieldCalendarProps) {
  const years = getYearRange(min, max);
  const currentYear = dayjs(calendarMonth).year();
  const currentMonth = dayjs(calendarMonth).month(); // 0-indexed

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onMonthChange(dayjs(calendarMonth).year(Number(e.target.value)).toDate());
  }

  function handleMonthSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onMonthChange(dayjs(calendarMonth).month(Number(e.target.value)).toDate());
  }

  return (
    <div data-testid="date-field-calendar">
      {/* Header */}
      <div className={calendarHeader}>
        <div className={calendarHeaderSelects}>
          <select
            className={nativeSelect}
            value={currentYear}
            onChange={handleYearChange}
            aria-label="Vuosi"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            className={nativeSelect}
            value={currentMonth}
            onChange={handleMonthSelectChange}
            aria-label="Kuukausi"
          >
            {FINNISH_MONTHS.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
        </div>
        <IconButton
          aria-label={prevMonthLabel}
          variant="dark"
          size="sm"
          onClick={() => onMonthChange(dayjs(calendarMonth).subtract(1, 'month').toDate())}
        >
          <ChevronUpIcon />
        </IconButton>
        <IconButton
          aria-label={nextMonthLabel}
          variant="dark"
          size="sm"
          onClick={() => onMonthChange(dayjs(calendarMonth).add(1, 'month').toDate())}
        >
          <ChevronDownIcon />
        </IconButton>
      </div>

      {/* Grid */}
      <div className={calendarGrid}>
        <Calendar
          locale="fi"
          firstDayOfWeek={1}
          level="month"
          date={calendarMonth}
          onDateChange={onMonthChange}
          getDayProps={(date) => {
            const isStaged = stagedDate
              ? dayjs(date).isSame(dayjs(stagedDate), 'day')
              : false;
            const isToday = dayjs(date).isSame(dayjs(), 'day');
            const isOutside = !dayjs(date).isSame(dayjs(calendarMonth), 'month');
            const isDisabled =
              (min !== undefined && dayjs(date).isBefore(dayjs(min), 'day')) ||
              (max !== undefined && dayjs(date).isAfter(dayjs(max), 'day'));

            return {
              className: cx({
                [dayCellStaged]: isStaged,
                [dayCellToday]: isToday && !isStaged,
                [dayCellOutsideMonth]: isOutside,
                [dayCellDisabled]: isDisabled,
              }),
              disabled: isDisabled,
              'aria-pressed': isStaged,
              onClick: isDisabled ? undefined : () => onStagedDateChange(date),
            };
          }}
        />
      </div>

      {/* Footer */}
      <div className={calendarFooter}>
        <Button variant="text" onClick={onToday}>{todayLabel}</Button>
        <Button variant="outlined" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant="filled" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. If `Calendar` props differ from the types above (e.g. `onDateChange` vs `onChange`), check `node_modules/@mantine/dates/types` and use the correct prop name.

- [ ] **Step 5: Commit**

```bash
git add src/components/DateField/DateFieldCalendar.tsx src/components/DateField/DateField.stories.tsx
git commit -m "feat(#52): implement DateFieldCalendar subcomponent"
```

---

### Task 5: DateField main component

**Files:**
- Modify: `src/components/DateField/DateField.tsx`
- Modify: `src/components/DateField/DateField.stories.tsx`

**Interfaces:**
- Consumes: `DateFieldCalendar`, `DateFieldCalendarProps` (Task 4)
- Consumes: `TextField` from `'../TextField'`, `IconButton` from `'../IconButton'`, `CalendarIcon` from `'../../icons/CalendarIcon'`
- Consumes: `Popover`, `FocusTrap` from `'@mantine/core'`
- Consumes CSS from Task 3: `popoverContent`, `visuallyHidden`
- Produces: `DateField` fully implemented — all stories and interaction tests in Task 6 depend on this

- [ ] **Step 1: Write a failing interaction story**

Add to `DateField.stories.tsx`:

```typescript
import dayjs from 'dayjs';

export const StageAndConfirm: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(new Date(2025, 7, 1));
    return (
      <>
        <DateField {...args} value={value} onChange={setValue} />
        <div data-testid="output">{value ? dayjs(value).format('DD.MM.YYYY') : 'none'}</div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    // Stage day 16 (not day 1 which is the committed date)
    const allButtons = canvas.getAllByRole('button');
    const day16 = allButtons.find(
      (b) => b.textContent?.trim() === '16' && !b.hasAttribute('disabled')
    );
    await userEvent.click(day16!);
    // onChange not yet called — output still shows original
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
    // Confirm
    await userEvent.click(canvas.getByText('Valitse'));
    await expect(canvas.queryByTestId('date-field-calendar')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('output').textContent).toBe('16.08.2025');
  },
};
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npm test 2>&1 | grep -A 5 "StageAndConfirm"
```

Expected: test fails — stub `DateField` has no popover or calendar.

- [ ] **Step 3: Implement DateField**

Replace `src/components/DateField/DateField.tsx` with:

```typescript
import { useRef, useState } from 'react';
import { FocusTrap, Popover } from '@mantine/core';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/fi';
import cx from 'clsx';
import { TextField } from '../TextField';
import { IconButton } from '../IconButton';
import { CalendarIcon } from '../../icons/CalendarIcon';
import { DateFieldCalendar } from './DateFieldCalendar';
import { popoverContent, visuallyHidden } from './DateField.css.ts';

dayjs.extend(customParseFormat);

const DATE_FORMAT = 'DD.MM.YYYY';

function parseDate(text: string): Date | null {
  const parsed = dayjs(text, DATE_FORMAT, true);
  return parsed.isValid() ? parsed.toDate() : null;
}

function formatDate(date: Date | null): string {
  return date ? dayjs(date).format(DATE_FORMAT) : '';
}

function isInRange(date: Date, min?: Date, max?: Date): boolean {
  if (min && dayjs(date).isBefore(dayjs(min), 'day')) return false;
  if (max && dayjs(date).isAfter(dayjs(max), 'day')) return false;
  return true;
}

export interface DateFieldClassNames {
  root: string;
  input: string;
  calendar: string;
  header: string;
  footer: string;
}

export interface DateFieldProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  required?: boolean;
  calendarButtonLabel: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  todayLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  classNames?: Partial<DateFieldClassNames>;
}

export function DateField({
  value,
  onChange,
  label,
  helperText,
  error,
  placeholder = 'PP.KK.VVVV',
  min,
  max,
  disabled,
  required,
  calendarButtonLabel,
  prevMonthLabel,
  nextMonthLabel,
  todayLabel = 'Tänään',
  cancelLabel = 'Peruuta',
  confirmLabel = 'Valitse',
  classNames,
}: DateFieldProps) {
  const isControlled = value !== undefined;
  const [internalCommitted, setInternalCommitted] = useState<Date | null>(null);
  const committedDate = isControlled ? (value ?? null) : internalCommitted;

  const [textValue, setTextValue] = useState(() => formatDate(committedDate));
  const [isOpen, setIsOpen] = useState(false);
  const [stagedDate, setStagedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => committedDate ?? new Date());
  const [liveMessage, setLiveMessage] = useState('');

  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  function commit(date: Date | null) {
    if (!isControlled) setInternalCommitted(date);
    onChange?.(date);
  }

  function openCalendar() {
    setStagedDate(committedDate);
    setCalendarMonth(committedDate ?? new Date());
    setIsOpen(true);
  }

  function closeCalendar() {
    setIsOpen(false);
    setStagedDate(null);
    requestAnimationFrame(() => calendarButtonRef.current?.focus());
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.currentTarget.value;
    setTextValue(raw);
    const parsed = parseDate(raw);
    if (parsed && isInRange(parsed, min, max)) {
      commit(parsed);
      setCalendarMonth(parsed);
    }
  }

  function handleTextBlur() {
    const parsed = parseDate(textValue);
    if (!parsed || !isInRange(parsed, min, max)) {
      setTextValue(formatDate(committedDate));
    }
  }

  function handleConfirm() {
    if (stagedDate) {
      commit(stagedDate);
      setTextValue(formatDate(stagedDate));
    }
    closeCalendar();
  }

  function handleToday() {
    const today = new Date();
    setStagedDate(today);
    setCalendarMonth(today);
  }

  function handleStagedDateChange(date: Date) {
    setStagedDate(date);
    setLiveMessage(dayjs(date).locale('fi').format('dddd D. MMMM YYYY'));
  }

  return (
    <Popover
      opened={isOpen}
      onClose={closeCalendar}
      position="bottom-start"
      withinPortal
    >
      <Popover.Target>
        <div data-testid="date-field">
          <TextField
            inputLabel={label}
            helperText={helperText}
            error={error}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            value={textValue}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            classNames={classNames ? { root: classNames.root, wrapper: classNames.input } : undefined}
            endInstance={
              <IconButton
                ref={calendarButtonRef}
                aria-label={calendarButtonLabel}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                variant="dark"
                size="sm"
                disabled={disabled}
                onClick={isOpen ? closeCalendar : openCalendar}
              >
                <CalendarIcon />
              </IconButton>
            }
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown className={cx(popoverContent, classNames?.calendar)}>
        <span aria-live="polite" aria-atomic="true" className={visuallyHidden}>
          {liveMessage}
        </span>
        <FocusTrap active={isOpen}>
          <div role="dialog" aria-label={calendarButtonLabel}>
            <DateFieldCalendar
              stagedDate={stagedDate}
              calendarMonth={calendarMonth}
              onMonthChange={setCalendarMonth}
              onStagedDateChange={handleStagedDateChange}
              onConfirm={handleConfirm}
              onCancel={closeCalendar}
              onToday={handleToday}
              min={min}
              max={max}
              prevMonthLabel={prevMonthLabel}
              nextMonthLabel={nextMonthLabel}
              todayLabel={todayLabel}
              cancelLabel={cancelLabel}
              confirmLabel={confirmLabel}
            />
          </div>
        </FocusTrap>
      </Popover.Dropdown>
    </Popover>
  );
}
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. If `TextField` `classNames` rejects `root`/`wrapper` keys, check `TextField.tsx` for valid classNames keys and use those names instead.

- [ ] **Step 5: Commit**

```bash
git add src/components/DateField/DateField.tsx src/components/DateField/DateField.stories.tsx
git commit -m "feat(#52): implement DateField main component"
```

---

### Task 6: Complete story suite and interaction tests

**Files:**
- Modify: `src/components/DateField/DateField.stories.tsx`

**Interfaces:**
- Consumes: `DateField` (Task 5 — fully implemented)

- [ ] **Step 1: Replace DateField.stories.tsx with full story suite**

```typescript
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from '@storybook/test';
import dayjs from 'dayjs';
import { DateField } from './DateField';

const meta = {
  component: DateField,
  args: {
    calendarButtonLabel: 'Avaa kalenteri',
    prevMonthLabel: 'Edellinen kuukausi',
    nextMonthLabel: 'Seuraava kuukausi',
    label: 'Otsake',
    placeholder: 'PP.KK.VVVV',
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Render stories ──────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: new Date(2025, 7, 16) },
};

export const Disabled: Story = {
  args: { disabled: true, value: new Date(2025, 7, 16) },
};

export const WithError: Story = {
  args: { error: 'Päivämäärä on virheellinen' },
};

export const WithHelperText: Story = {
  args: { helperText: 'Muoto: PP.KK.VVVV' },
};

export const WithMinMax: Story = {
  args: {
    min: new Date(2025, 7, 10),
    max: new Date(2025, 7, 20),
    value: new Date(2025, 7, 16),
  },
};

// ── Interaction tests ────────────────────────────────────────────────────────

export const OpenCalendar: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await expect(canvas.getByTestId('date-field-calendar')).toBeInTheDocument();
  },
};

export const CloseWithCancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await userEvent.click(canvas.getByText('Peruuta'));
    await expect(canvas.queryByTestId('date-field-calendar')).not.toBeInTheDocument();
  },
};

export const NavigatePrevMonth: Story = {
  args: { value: new Date(2025, 7, 16) }, // August 2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const monthSelect = canvas.getByRole('combobox', { name: 'Kuukausi' }) as HTMLSelectElement;
    const before = Number(monthSelect.value); // 7 = August
    await userEvent.click(canvas.getByLabelText('Edellinen kuukausi'));
    await expect(Number(monthSelect.value)).toBe(before - 1); // 6 = July
  },
};

export const NavigateNextMonth: Story = {
  args: { value: new Date(2025, 7, 16) }, // August 2025
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const monthSelect = canvas.getByRole('combobox', { name: 'Kuukausi' }) as HTMLSelectElement;
    const before = Number(monthSelect.value); // 7 = August
    await userEvent.click(canvas.getByLabelText('Seuraava kuukausi'));
    await expect(Number(monthSelect.value)).toBe(before + 1); // 8 = September
  },
};

export const StageAndConfirm: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(new Date(2025, 7, 1));
    return (
      <>
        <DateField {...args} value={value} onChange={setValue} />
        <div data-testid="output">{value ? dayjs(value).format('DD.MM.YYYY') : 'none'}</div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const allButtons = canvas.getAllByRole('button');
    const day16 = allButtons.find(
      (b) => b.textContent?.trim() === '16' && !b.hasAttribute('disabled')
    );
    await userEvent.click(day16!);
    // onChange not called yet — output still shows original committed date
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
    await userEvent.click(canvas.getByText('Valitse'));
    await expect(canvas.queryByTestId('date-field-calendar')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('output').textContent).toBe('16.08.2025');
  },
};

export const CancelDiscardsStage: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(new Date(2025, 7, 1));
    return (
      <>
        <DateField {...args} value={value} onChange={setValue} />
        <div data-testid="output">{value ? dayjs(value).format('DD.MM.YYYY') : 'none'}</div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    const allButtons = canvas.getAllByRole('button');
    const day16 = allButtons.find(
      (b) => b.textContent?.trim() === '16' && !b.hasAttribute('disabled')
    );
    await userEvent.click(day16!);
    await userEvent.click(canvas.getByText('Peruuta'));
    // Staged date discarded — original value unchanged
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
  },
};

export const TodayButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Avaa kalenteri'));
    await userEvent.click(canvas.getByText('Tänään'));
    const yearSelect = canvas.getByRole('combobox', { name: 'Vuosi' }) as HTMLSelectElement;
    await expect(Number(yearSelect.value)).toBe(new Date().getFullYear());
  },
};

export const TypeValidDate: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
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
    const [value, setValue] = React.useState<Date | null>(new Date(2025, 7, 1));
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
    // Field reverts to committed value; onChange was never called with the invalid text
    await expect(input.value).toBe('01.08.2025');
    await expect(canvas.getByTestId('output').textContent).toBe('01.08.2025');
  },
};

export const TypeDateOutsideRange: Story = {
  args: {
    min: new Date(2025, 7, 10),
    max: new Date(2025, 7, 20),
  },
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
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
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: all stories pass. If an interaction test fails, read the error and fix the component in `DateField.tsx` or `DateFieldCalendar.tsx` — the tests encode the acceptance criteria. Do not weaken the tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/DateField/DateField.stories.tsx
git commit -m "feat(#52): add DateField stories and interaction tests"
```

---

### Task 7: Build verification and export check

**Files:**
- Verify: `src/components/index.tsx`
- Verify: `src/index.ts`

**Interfaces:**
- Consumes: all DateField exports
- Produces: `dist/index.esm.js`, `dist/index.cjs`, `dist/index.d.ts` — all containing `DateField`

- [ ] **Step 1: Verify barrel export**

Confirm `src/components/index.tsx` has this line (added in Task 2):

```typescript
export { DateField, type DateFieldProps, type DateFieldClassNames } from './DateField';
```

If missing, add it now.

- [ ] **Step 2: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: all stories pass with no a11y violations flagged as errors.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: exits 0. Check that `dist/index.d.ts` contains `DateField`:

```bash
grep "DateField" dist/index.d.ts
```

Expected: at least one line containing `DateField`.

- [ ] **Step 5: Final commit**

```bash
git add dist/ src/
git commit -m "feat(#52): verify DateField build and exports"
```

---

## Self-Review

**Spec coverage:**
- ✅ `@mantine/dates` peer dependency — Task 1
- ✅ Typeable text field with DD.MM.YYYY parsing — Task 5 (`parseDate` with dayjs strict)
- ✅ Calendar icon button toggling popover — Task 5
- ✅ Calendar header: year/month `<select>` + `ChevronUpIcon`/`ChevronDownIcon` nav — Task 4
- ✅ Pick-then-confirm footer: Tänään/Peruuta/Valitse — Task 4
- ✅ Finnish locale (`locale="fi"`, `firstDayOfWeek={1}`) — Task 4
- ✅ Day cell states (staged, today, outside-month, disabled) — Tasks 3 + 4
- ✅ Disabled state (field + button) — Task 5 (`disabled` prop)
- ✅ min/max constraints — Tasks 4 + 5
- ✅ Label, helper text, error — Task 5 (passed to `TextField`)
- ✅ Responsive — `vars` tokens auto-update via breakpoint CSS variables; no extra work needed
- ✅ Accessibility: `aria-haspopup`, `aria-expanded`, `FocusTrap`, `role="dialog"`, live region, required `aria-label` props — Task 5
- ✅ Vitest stories + play functions — Task 6
- ✅ Barrel export — Tasks 2 + 7

**Placeholder scan:** None found.

**Type consistency:**
- `DateFieldCalendarProps` defined identically in Task 2 stub and Task 4 implementation ✅
- `DateFieldProps` / `DateFieldClassNames` defined in Task 2, re-used verbatim in Task 5 ✅
- CSS exports named in Task 3 Interfaces match imports in Tasks 4 and 5 ✅
- `DateFieldCalendar` `onCancel` callback wired to `closeCalendar` in Task 5 ✅
