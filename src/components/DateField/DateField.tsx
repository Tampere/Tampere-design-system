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
    if (!isInRange(today, min, max)) return;
    setStagedDate(today);
    setCalendarMonth(today);
  }

  function handleStagedDateChange(date: Date) {
    setStagedDate(date);
    setLiveMessage(dayjs(date).locale('fi').format('dddd D. MMMM YYYY'));
  }

  return (
    <Popover opened={isOpen} onClose={closeCalendar} position="bottom-start">
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
            classNames={
              classNames ? { root: classNames.root, wrapper: classNames.input } : undefined
            }
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
