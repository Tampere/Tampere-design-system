import { useEffect, useId, useRef, useState } from 'react';
import { FocusTrap, Popover } from '@mantine/core';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/fi';
import cx from 'clsx';
import { TextField } from '../TextField';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { CalendarIcon } from '../../icons/CalendarIcon';
import { CloseIcon } from '../../icons/CloseIcon';
import { DateFieldCalendar } from './DateFieldCalendar';
import { popoverContent, visuallyHidden, triggerIcon } from './DateField.css.ts';

dayjs.extend(customParseFormat);
// Needed for the `LL` token (used for the fi-locale day-level live announcement
// below) — without it dayjs leaves L/LL/LLL/LLLL unexpanded in `format()`.
dayjs.extend(localizedFormat);

const DATE_FORMAT = 'DD.MM.YYYY';

// Accept every leading-zero combination of the Finnish d.m.yyyy form (1.8.2025,
// 01.08.2025, 1.08.2025, …); display always normalises back to DATE_FORMAT.
// Strict parsing still rejects impossible dates (29.02 on a non-leap year, 32.13).
const PARSE_FORMATS = ['DD.MM.YYYY', 'D.M.YYYY', 'D.MM.YYYY', 'DD.M.YYYY'];

function parseDate(text: string): Date | null {
  const parsed = dayjs(text, PARSE_FORMATS, true);
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

// The calendar is either closed, or open with its own staged date and visible
// month — modelling this as one discriminated union (rather than three
// independent booleans/dates) makes "staged a date while closed" a type error
// instead of a runtime possibility.
type CalendarSession = { open: false } | { open: true; staged: Date | null; month: Date };

export interface DateFieldClassNames {
  root: string;
  input: string;
  calendar: string;
}

export interface DateFieldProps {
  /**
   * Committed date. Omit for an uncontrolled field that manages its own value.
   * When controlled, the displayed value always reflects this prop: if your
   * `onChange` normalises or rejects the date, pass the result back here (or leave
   * it unchanged to veto the edit — the field then keeps showing the typed text).
   */
  value?: Date | null;
  /**
   * Called with the committed date, or `null` when cleared. Fires only when the
   * committed value actually changes — not on every keystroke, and not again on
   * blur for an already-committed date. Typing an unparseable or out-of-range
   * value over a valid one surfaces an error and keeps the last committed value;
   * it does not fire `onChange(null)`.
   */
  onChange?: (date: Date | null) => void;
  /** Visible field label. Provide this, `aria-label`, or `aria-labelledby` so the date input has an accessible name. */
  label?: string;
  /** Accessible name for the date input when no visible `label` is used. */
  'aria-label'?: string;
  /** Id of an element labelling the date input when no visible `label` is used. */
  'aria-labelledby'?: string;
  /**
   * Date-format instruction announced to assistive tech via the input's
   * description (visually hidden). Set to '' to omit. Default: Finnish.
   */
  formatDescription?: string;
  helperText?: string;
  error?: string;
  /** Message shown when typed text cannot be parsed as a date. */
  invalidDateError?: string;
  /** Message shown when a parseable typed date falls outside [min, max]. */
  outOfRangeError?: string;
  placeholder?: string;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  required?: boolean;
  calendarButtonLabel: string;
  /** Accessible name for the clear (✕) button shown when the field has a value. */
  clearButtonLabel?: string;
  /** Accessible name for the calendar dialog. Default: Finnish. */
  calendarDialogLabel?: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  /** Accessible name for the calendar's year `<select>`. Default: Finnish. */
  yearLabel?: string;
  /** Accessible name for the calendar's month `<select>`. Default: Finnish. */
  monthLabel?: string;
  todayLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  classNames?: Partial<DateFieldClassNames>;
}

export function DateField({
  value,
  onChange,
  label,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  helperText,
  error,
  invalidDateError = 'Virheellinen päivämäärä',
  outOfRangeError = 'Päivämäärä on sallitun välin ulkopuolella',
  formatDescription = 'Päivämäärän muoto: päivä.kuukausi.vuosi',
  placeholder = 'PP.KK.VVVV',
  min,
  max,
  disabled,
  required,
  calendarButtonLabel,
  clearButtonLabel = 'Tyhjennä päivämäärä',
  calendarDialogLabel = 'Valitse päivämäärä',
  prevMonthLabel,
  nextMonthLabel,
  yearLabel = 'Vuosi',
  monthLabel = 'Kuukausi',
  todayLabel = 'Tänään',
  cancelLabel = 'Peruuta',
  confirmLabel = 'Valitse',
  classNames,
}: DateFieldProps) {
  const isControlled = value !== undefined;
  const [internalCommitted, setInternalCommitted] = useState<Date | null>(null);
  const rawCommitted = isControlled ? (value ?? null) : internalCommitted;
  const committedDate = rawCommitted && !dayjs(rawCommitted).isValid() ? null : rawCommitted;

  const [textValue, setTextValue] = useState(() => formatDate(committedDate));
  const [session, setSession] = useState<CalendarSession>({ open: false });
  // Popover.Dropdown keeps its content mounted during the ~150ms close-fade, so
  // the dialog still renders once more with session.open === false. Falling back
  // to null/new Date() for that render would flash the grid to today's month
  // mid-fade; this remembers the last real staged/month values — updated
  // alongside every setSession call that stages a date or moves the month (see
  // openCalendar, handleTextChange, handleToday, handleMonthChange,
  // handleStagedDateChange below) — so the exit transition can reuse them
  // instead. Deliberately not stored on the `{ open: false }` session variant —
  // that would let staged/month be written independently again, exactly what the
  // CalendarSession union is meant to prevent. Plain state (not a ref), and
  // updated inline rather than from a `useEffect`, because this codebase's lint
  // config forbids both reading ref values and calling setState during render.
  const [lastSession, setLastSession] = useState<{ staged: Date | null; month: Date }>({
    staged: null,
    month: new Date(),
  });
  const [liveMessage, setLiveMessage] = useState('');
  // Validation error for the typed text. The consumer-supplied `error` prop, when
  // present, takes precedence over this internal one.
  const [internalError, setInternalError] = useState<string | null>(null);

  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isInputFocusedRef = useRef(false);
  const dialogId = useId();

  useEffect(() => {
    if (!isInputFocusedRef.current) {
      setTextValue(formatDate(committedDate));
      setInternalError(null);
    }
  }, [committedDate]);

  // Dev-only guard: without a visible label or an aria-label/aria-labelledby the
  // date input has no accessible name (the placeholder is not a name).
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !label && !ariaLabel && !ariaLabelledby) {
      console.error(
        'DateField: provide a `label`, `aria-label`, or `aria-labelledby` so the date input has an accessible name.'
      );
    }
  }, [label, ariaLabel, ariaLabelledby]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && value && !dayjs(value).isValid()) {
      console.error('DateField: `value` must be a valid Date or null.');
    }
  }, [value]);

  // Dev-only guard: an invalid min/max would otherwise silently disable every
  // range check, since dayjs comparisons against an Invalid Date always
  // return false.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (min && !dayjs(min).isValid()) console.error('DateField: `min` must be a valid Date.');
      if (max && !dayjs(max).isValid()) console.error('DateField: `max` must be a valid Date.');
    }
  }, [min, max]);

  // Normalize the range bounds once: drop an invalid bound (treat as absent),
  // then correct a swapped pair (min after max). Validating before swapping
  // matters — comparing against an unparseable date is meaningless — so every
  // other range check below reads rangeMin/rangeMax, never the raw props.
  const validMin = min && dayjs(min).isValid() ? min : undefined;
  const validMax = max && dayjs(max).isValid() ? max : undefined;
  const [rangeMin, rangeMax] =
    validMin && validMax && dayjs(validMax).isBefore(dayjs(validMin), 'day')
      ? [validMax, validMin]
      : [validMin, validMax];

  function commit(date: Date | null) {
    // Skip no-op commits so onChange isn't re-fired with an equal value (e.g. the
    // keystroke that completes a valid date already commits it, then blur would
    // commit the same day again as a fresh Date instance). Compare at day
    // granularity, treating both-null as equal.
    const unchanged =
      date === committedDate ||
      (date !== null && committedDate !== null && dayjs(date).isSame(committedDate, 'day'));
    if (unchanged) return;
    if (!isControlled) setInternalCommitted(date);
    onChange?.(date);
  }

  function openCalendar() {
    const staged = committedDate;
    const month = committedDate ?? new Date();
    setSession({ open: true, staged, month });
    setLastSession({ staged, month });
  }

  function closeCalendar() {
    // Only steal focus back to the trigger when it's still inside the dialog at
    // the moment of closing — that's Cancel/Confirm, plus Escape/outside-click
    // (wired below via Popover's onChange). Guarding on focus location rather
    // than assuming "always" keeps this correct across all of those callers.
    const focusStillInDialog = dialogRef.current?.contains(document.activeElement) ?? false;
    setSession({ open: false });
    if (focusStillInDialog) {
      requestAnimationFrame(() => calendarButtonRef.current?.focus());
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.currentTarget.value;
    setTextValue(raw);
    // Clear any standing validation error as soon as the user edits, so the
    // message disappears while they correct the value rather than nagging.
    setInternalError(null);
    const parsed = parseDate(raw);
    if (parsed && isInRange(parsed, rangeMin, rangeMax)) {
      commit(parsed);
      if (session.open) {
        setSession({ ...session, staged: parsed, month: parsed });
        setLastSession({ staged: parsed, month: parsed });
      }
    }
  }

  function handleTextFocus() {
    isInputFocusedRef.current = true;
  }

  function handleTextBlur() {
    isInputFocusedRef.current = false;
    // An empty field is not an error: revert to the committed value silently.
    if (textValue.trim() === '') {
      setInternalError(null);
      setTextValue(formatDate(committedDate));
      return;
    }
    const parsed = parseDate(textValue.trim());
    // Surface a message instead of silently discarding the input (WCAG 3.3.1).
    // The typed text is kept so the user can see and fix what they entered.
    if (!parsed) {
      setInternalError(invalidDateError);
      return;
    }
    if (!isInRange(parsed, rangeMin, rangeMax)) {
      setInternalError(outOfRangeError);
      return;
    }
    setInternalError(null);
    commit(parsed);
    setTextValue(formatDate(parsed));
  }

  function handleConfirm() {
    if (session.open && session.staged && isInRange(session.staged, rangeMin, rangeMax)) {
      commit(session.staged);
      setTextValue(formatDate(session.staged));
      setInternalError(null);
    }
    closeCalendar();
  }

  function handleClear() {
    setTextValue('');
    setInternalError(null);
    commit(null);
    // The ✕ disappears once the field is empty, so move focus to the adjacent calendar trigger rather than letting it fall back to <body>.
    requestAnimationFrame(() => calendarButtonRef.current?.focus());
  }

  function handleToday() {
    const today = new Date();
    // Redundant safety net: the calendar disables the Today button when today is
    // out of range, so this guard normally can't fire. Kept so a programmatic
    // trigger can't stage a date that could never be confirmed.
    if (!isInRange(today, rangeMin, rangeMax)) return;
    if (session.open) {
      setSession({ ...session, staged: today, month: today });
      setLastSession({ staged: today, month: today });
    }
    // 'LL' (fi locale: 'D. MMMM[ta] YYYY') rather than a literal 'D. MMMM YYYY'
    // template — the latter yields the nominative month form (e.g. "elokuu"),
    // which is grammatically wrong in this position; Finnish day-level dates need
    // the partitive ("elokuuta"), which the locale's LL format already supplies.
    setLiveMessage(dayjs(today).locale('fi').format('dddd LL'));
  }

  function handleMonthChange(month: Date) {
    // Functional updaters (reading `s`/`l` from the callback argument, not the
    // outer `session`/`lastSession` closure) so this composes correctly with
    // handleStagedDateChange when a day-cell click fires both in the same React
    // batch (see DateFieldCalendar's outside-month day onClick) — otherwise the
    // second call's closure read would clobber the first's update instead of
    // building on it.
    if (session.open) {
      setSession((s) => (s.open ? { ...s, month } : s));
      setLastSession((l) => ({ ...l, month }));
    }
    setLiveMessage(dayjs(month).locale('fi').format('MMMM YYYY'));
  }

  function handleStagedDateChange(date: Date) {
    // See handleMonthChange above re: functional updaters.
    if (session.open) {
      setSession((s) => (s.open ? { ...s, staged: date } : s));
      setLastSession((l) => ({ ...l, staged: date }));
    }
    // See handleToday above re: 'LL' vs. a literal 'D. MMMM YYYY' template.
    setLiveMessage(dayjs(date).locale('fi').format('dddd LL'));
  }

  // The date format is announced via the input's description (aria-describedby),
  // not the placeholder alone (WCAG 3.3.2). When helper text is visible the hint
  // rides alongside it (visually hidden); otherwise the whole description wrapper
  // is hidden so it adds no layout (see fieldClassNames below).
  const fieldDescription = formatDescription ? (
    helperText ? (
      <>
        {helperText} <span className={visuallyHidden}>{formatDescription}</span>
      </>
    ) : (
      formatDescription
    )
  ) : (
    helperText
  );

  // Show the clear (✕) button only when the field has something to clear and is
  // not disabled. Gating on the text (not just the committed date) means it also
  // appears while the user is mid-typing an entry.
  const showClear = !disabled && textValue.trim() !== '';

  // The "Confirm" action commits the staged date; when staged date is missing or
  // outside [min, max] it can never be committed, so disable the button instead of
  // silently no-opping. Read through lastSession while closed (see its
  // declaration above) so this doesn't flash to `true` during the close fade.
  const effectiveStaged = session.open ? session.staged : lastSession.staged;
  const confirmDisabled = !effectiveStaged || !isInRange(effectiveStaged, rangeMin, rangeMax);

  const fieldClassNames = {
    root: classNames?.root,
    wrapper: classNames?.input,
    // With no visible helper text, take the description wrapper out of the flex
    // flow (visuallyHidden is position:absolute) so the format hint is announced
    // without adding a gap below the input.
    description: !helperText && formatDescription ? visuallyHidden : undefined,
  };

  // Forward an aria-label/aria-labelledby only when there is no visible label,
  // so it can't silently override a visible label's accessible name.
  const inputAriaProps =
    !label && (ariaLabel || ariaLabelledby)
      ? { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby }
      : {};

  return (
    <Popover
      opened={session.open}
      // Popover is fully controlled (`opened`), so Mantine's own Escape/
      // outside-click handling — which drives the popover's internal setter,
      // not the `onClose` callback — only reaches us through `onChange`.
      // `onClose` alone (the previous wiring) is invoked reactively from an
      // internal effect that watches for `opened` to actually flip, which
      // never happens on its own in controlled mode: Escape/outside-click
      // silently no-op instead of calling `closeCalendar`.
      onChange={(opened) => {
        if (!opened) closeCalendar();
      }}
      position="bottom-end"
      // Mantine would otherwise add its own role="dialog" to the dropdown and
      // aria-haspopup/expanded/controls to the (non-interactive) target wrapper,
      // producing a second, unnamed dialog. We own these roles instead: the
      // trigger button carries the popup semantics and the dialog below is the
      // single, aria-labelled dialog the button's aria-controls points to.
      withRoles={false}
    >
      <Popover.Target>
        <div data-testid="date-field">
          <TextField
            inputLabel={label}
            {...inputAriaProps}
            helperText={fieldDescription}
            error={error ?? internalError ?? undefined}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            value={textValue}
            onChange={handleTextChange}
            onFocus={handleTextFocus}
            onBlur={handleTextBlur}
            classNames={fieldClassNames}
            rightSectionPointerEvents={showClear ? 'auto' : 'none'}
            rightSection={
              showClear ? (
                <IconButton
                  size="sm"
                  variant="default"
                  aria-label={clearButtonLabel}
                  onClick={handleClear}
                >
                  <CloseIcon />
                </IconButton>
              ) : undefined
            }
            endInstance={
              <Button
                ref={calendarButtonRef}
                variant="filled"
                aria-label={calendarButtonLabel}
                aria-expanded={session.open}
                aria-haspopup="dialog"
                // Only while open: Popover.Dropdown fully unmounts once its close
                // transition finishes (no `keepMounted`), so the dialog's id
                // doesn't exist in the DOM while closed — aria-controls must
                // reference an existing element (WCAG 4.1.2 / axe aria-valid-attr-value).
                aria-controls={session.open ? dialogId : undefined}
                disabled={disabled}
                onClick={session.open ? closeCalendar : openCalendar}
              >
                <CalendarIcon className={triggerIcon} />
              </Button>
            }
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown className={cx(popoverContent, classNames?.calendar)}>
        {/* FocusTrap clones its child and overwrites that child's `ref` prop with its
            own trap ref, so a plain `ref={dialogRef}` on the dialog <div> below would
            silently be discarded — `innerRef` is FocusTrap's documented escape hatch
            for also obtaining the trapped element (used by closeCalendar to check
            whether focus is still inside the dialog before stealing it back). */}
        <FocusTrap active={session.open} innerRef={dialogRef}>
          <div id={dialogId} role="dialog" aria-modal="true" aria-label={calendarDialogLabel}>
            <span
              data-testid="date-field-live"
              aria-live="polite"
              aria-atomic="true"
              className={visuallyHidden}
            >
              {liveMessage}
            </span>
            <DateFieldCalendar
              stagedDate={session.open ? session.staged : lastSession.staged}
              calendarMonth={session.open ? session.month : lastSession.month}
              onMonthChange={handleMonthChange}
              onStagedDateChange={handleStagedDateChange}
              onConfirm={handleConfirm}
              onCancel={closeCalendar}
              onToday={handleToday}
              min={rangeMin}
              max={rangeMax}
              prevMonthLabel={prevMonthLabel}
              nextMonthLabel={nextMonthLabel}
              yearLabel={yearLabel}
              monthLabel={monthLabel}
              todayLabel={todayLabel}
              cancelLabel={cancelLabel}
              confirmLabel={confirmLabel}
              confirmDisabled={confirmDisabled}
            />
          </div>
        </FocusTrap>
      </Popover.Dropdown>
    </Popover>
  );
}
