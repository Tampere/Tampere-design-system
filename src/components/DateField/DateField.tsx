import { useEffect, useId, useRef, useState } from 'react';
import { FocusTrap, Popover } from '@mantine/core';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/fi';
import cx from 'clsx';
import { TextField } from '../TextField';
import { Button } from '../Button';
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
  prevMonthLabel,
  nextMonthLabel,
  todayLabel = 'Tänään',
  cancelLabel = 'Peruuta',
  confirmLabel = 'Vahvista',
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
  // Validation error for the typed text. The consumer-supplied `error` prop, when
  // present, takes precedence over this internal one.
  const [internalError, setInternalError] = useState<string | null>(null);

  const calendarButtonRef = useRef<HTMLButtonElement>(null);
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
    // Clear any standing validation error as soon as the user edits, so the
    // message disappears while they correct the value rather than nagging.
    setInternalError(null);
    const parsed = parseDate(raw);
    if (parsed && isInRange(parsed, min, max)) {
      commit(parsed);
      setCalendarMonth(parsed);
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
    const parsed = parseDate(textValue);
    // Surface a message instead of silently discarding the input (WCAG 3.3.1).
    // The typed text is kept so the user can see and fix what they entered.
    if (!parsed) {
      setInternalError(invalidDateError);
      return;
    }
    if (!isInRange(parsed, min, max)) {
      setInternalError(outOfRangeError);
      return;
    }
    setInternalError(null);
    commit(parsed);
    setTextValue(formatDate(parsed));
  }

  function handleConfirm() {
    if (stagedDate) {
      commit(stagedDate);
      setTextValue(formatDate(stagedDate));
      setInternalError(null);
    }
    closeCalendar();
  }

  function handleToday() {
    const today = new Date();
    if (!isInRange(today, min, max)) return;
    setStagedDate(today);
    setCalendarMonth(today);
  }

  function handleMonthChange(month: Date) {
    setCalendarMonth(month);
    setLiveMessage(dayjs(month).locale('fi').format('MMMM YYYY'));
  }

  function handleStagedDateChange(date: Date) {
    setStagedDate(date);
    setLiveMessage(dayjs(date).locale('fi').format('dddd D. MMMM YYYY'));
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
      opened={isOpen}
      onClose={closeCalendar}
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
            endInstance={
              <Button
                ref={calendarButtonRef}
                variant="filled"
                aria-label={calendarButtonLabel}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                aria-controls={dialogId}
                disabled={disabled}
                onClick={isOpen ? closeCalendar : openCalendar}
              >
                <CalendarIcon {...(!disabled && { fill: 'white' })} />
              </Button>
            }
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown className={cx(popoverContent, classNames?.calendar)}>
        <span
          data-testid="date-field-live"
          aria-live="polite"
          aria-atomic="true"
          className={visuallyHidden}
        >
          {liveMessage}
        </span>
        <FocusTrap active={isOpen}>
          <div id={dialogId} role="dialog" aria-modal="true" aria-label={calendarButtonLabel}>
            <DateFieldCalendar
              stagedDate={stagedDate}
              calendarMonth={calendarMonth}
              onMonthChange={handleMonthChange}
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
