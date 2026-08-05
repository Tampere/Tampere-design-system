import { Calendar } from '@mantine/dates';
import '@mantine/dates/styles.layer.css';
import dayjs from 'dayjs';
import 'dayjs/locale/fi';
import cx from 'clsx';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { ChevronLeftIcon } from '../../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
import { ChevronDownIcon } from '../../icons/ChevronDownIcon';
import {
  calendar,
  calendarHeader,
  calendarHeaderSelects,
  calendarFooter,
  footerActions,
  calendarGrid,
  dayCellStaged,
  dayCellToday,
  dayCellOutsideMonth,
  dayCellDisabled,
  nativeSelect,
  nativeSelectWrapper,
  nativeSelectIcon,
  hiddenCalendarHeader,
} from './DateField.css.ts';

const FINNISH_MONTHS = [
  'Tammikuu',
  'Helmikuu',
  'Maaliskuu',
  'Huhtikuu',
  'Toukokuu',
  'Kesäkuu',
  'Heinäkuu',
  'Elokuu',
  'Syyskuu',
  'Lokakuu',
  'Marraskuu',
  'Joulukuu',
];

function getYearRange(currentYear: number, min?: Date, max?: Date): number[] {
  const today = new Date();
  let start = min ? min.getFullYear() : today.getFullYear() - 100;
  let end = max ? max.getFullYear() : today.getFullYear() + 20;
  // The displayed year must always have a matching <option>, even when it
  // falls outside [min, max] (e.g. today is outside a past-only range).
  start = Math.min(start, currentYear);
  end = Math.max(end, currentYear);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// A month/year is selectable only when some day in it falls within [min, max];
// fully out-of-range periods are disabled in the header selects so the user can't
// navigate to an all-disabled grid with no explanation.
function isMonthInRange(year: number, month: number, min?: Date, max?: Date): boolean {
  const start = dayjs().year(year).month(month).startOf('month');
  const end = start.endOf('month');
  if (min && end.isBefore(dayjs(min), 'day')) return false;
  if (max && start.isAfter(dayjs(max), 'day')) return false;
  return true;
}

function isYearInRange(year: number, min?: Date, max?: Date): boolean {
  const start = dayjs().year(year).startOf('year');
  const end = start.endOf('year');
  if (min && end.isBefore(dayjs(min), 'day')) return false;
  if (max && start.isAfter(dayjs(max), 'day')) return false;
  return true;
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
  yearLabel: string;
  monthLabel: string;
  todayLabel: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmDisabled: boolean;
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
  yearLabel,
  monthLabel,
  todayLabel,
  cancelLabel,
  confirmLabel,
  confirmDisabled,
}: DateFieldCalendarProps) {
  const currentYear = dayjs(calendarMonth).year();
  const currentMonth = dayjs(calendarMonth).month(); // 0-indexed
  const years = getYearRange(currentYear, min, max);

  const prevDisabled =
    min !== undefined &&
    dayjs(calendarMonth).subtract(1, 'month').endOf('month').isBefore(dayjs(min), 'day');
  const nextDisabled =
    max !== undefined &&
    dayjs(calendarMonth).add(1, 'month').startOf('month').isAfter(dayjs(max), 'day');

  // The "Today" action stages today's date; when today is outside [min, max]
  // it can never be staged, so disable the button instead of silently no-opping.
  const today = dayjs();
  const todayDisabled =
    (min !== undefined && today.isBefore(dayjs(min), 'day')) ||
    (max !== undefined && today.isAfter(dayjs(max), 'day'));

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onMonthChange(dayjs(calendarMonth).year(Number(e.target.value)).toDate());
  }

  function handleMonthSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onMonthChange(dayjs(calendarMonth).month(Number(e.target.value)).toDate());
  }

  return (
    <div className={calendar} data-testid="date-field-calendar">
      <div className={calendarHeader}>
        <IconButton
          aria-label={prevMonthLabel}
          variant="dark"
          size="sm"
          disabled={prevDisabled}
          onClick={() => {
            if (!prevDisabled) onMonthChange(dayjs(calendarMonth).subtract(1, 'month').toDate());
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <div className={calendarHeaderSelects}>
          <span className={nativeSelectWrapper}>
            <select
              className={nativeSelect}
              value={currentYear}
              onChange={handleYearChange}
              aria-label={yearLabel}
            >
              {years.map((y) => (
                <option key={y} value={y} disabled={!isYearInRange(y, min, max)}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDownIcon className={nativeSelectIcon} aria-hidden />
          </span>
          <span className={nativeSelectWrapper}>
            <select
              className={nativeSelect}
              value={currentMonth}
              onChange={handleMonthSelectChange}
              aria-label={monthLabel}
            >
              {FINNISH_MONTHS.map((name, i) => (
                <option key={i} value={i} disabled={!isMonthInRange(currentYear, i, min, max)}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className={nativeSelectIcon} aria-hidden />
          </span>
        </div>
        <IconButton
          aria-label={nextMonthLabel}
          variant="dark"
          size="sm"
          disabled={nextDisabled}
          onClick={() => {
            if (!nextDisabled) onMonthChange(dayjs(calendarMonth).add(1, 'month').toDate());
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>

      {/*
        Mantine v8 Calendar uses 'YYYY-MM-DD' STRINGS, not Date objects:
        - `date` (controlled displayed month) is a string → format calendarMonth out
        - `onDateChange` hands back a string → parse it to a Date before bubbling up
        - the `date` argument to `getDayProps` is a string → compare via dayjs(string)
          and convert to a Date before calling onStagedDateChange
        All string↔Date conversion stays inside this component.
      */}
      <div className={calendarGrid}>
        <Calendar
          locale="fi"
          firstDayOfWeek={1}
          level="month"
          weekdayFormat={(dateStr) => {
            const label = dayjs(dateStr).locale('fi').format('dd');
            return label.charAt(0).toUpperCase() + label.slice(1);
          }}
          date={dayjs(calendarMonth).format('YYYY-MM-DD')}
          onDateChange={(value) => onMonthChange(dayjs(value).toDate())}
          classNames={{ calendarHeader: hiddenCalendarHeader }}
          getDayProps={(dateString) => {
            const day = dayjs(dateString); // dateString is 'YYYY-MM-DD'
            const isStaged = stagedDate ? day.isSame(dayjs(stagedDate), 'day') : false;
            const isToday = day.isSame(dayjs(), 'day');
            const isOutside = !day.isSame(dayjs(calendarMonth), 'month');
            const isDisabled =
              (min !== undefined && day.isBefore(dayjs(min), 'day')) ||
              (max !== undefined && day.isAfter(dayjs(max), 'day'));
            // Cell that should receive focus when the calendar opens: the staged
            // day, or today when nothing is staged. FocusTrap honours
            // data-autofocus, so focus lands in the grid rather than on the
            // previous-month arrow (WCAG 2.4.3 / APG date-picker pattern).
            const isFocusTarget =
              !isDisabled && !isOutside && (isStaged || (!stagedDate && isToday));

            return {
              className: cx({
                [dayCellStaged]: isStaged,
                [dayCellToday]: isToday && !isStaged,
                [dayCellOutsideMonth]: isOutside,
                [dayCellDisabled]: isDisabled,
              }),
              disabled: isDisabled,
              // Align Mantine's roving-tabindex origin (getDateInTabOrder picks the
              // `selected` date first) with the staged day, so Tab into/out of the
              // grid returns to it.
              selected: isStaged,
              // aria-pressed announces the toggled "pressed" state to AT; we keep it
              // rather than re-implement Mantine's grid. If APG semantics become a
              // hard requirement, this needs a bespoke grid instead of Mantine's Calendar.
              'aria-pressed': isStaged,
              // Today is shown with a dashed outline; expose it programmatically
              // too so screen-reader users can identify it (WCAG 1.3.1 / 1.4.1).
              ...(isToday && { 'aria-current': 'date' as const }),
              ...(isFocusTarget && { 'data-autofocus': true }),
              onClick: isDisabled
                ? undefined
                : () => {
                    // Clicking a trailing/leading day of an adjacent month must
                    // bring that month into view, otherwise the staged highlight
                    // lands off-screen and the user gets no selection feedback.
                    if (isOutside) onMonthChange(day.toDate());
                    onStagedDateChange(day.toDate());
                  },
            };
          }}
        />
      </div>

      {/* Footer: Today on the left, cancel + confirm grouped on the right (Figma layout). */}
      <div className={calendarFooter}>
        <Button variant="text" onClick={onToday} disabled={todayDisabled}>
          {todayLabel}
        </Button>
        <div className={footerActions}>
          <Button variant="outlined" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="filled" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
