import { Calendar } from '@mantine/dates';
import '@mantine/dates/styles.layer.css';
import dayjs from 'dayjs';
import 'dayjs/locale/fi';
import cx from 'clsx';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { ChevronLeftIcon } from '../../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
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

  const prevDisabled =
    min !== undefined &&
    dayjs(calendarMonth).subtract(1, 'month').endOf('month').isBefore(dayjs(min), 'day');
  const nextDisabled =
    max !== undefined &&
    dayjs(calendarMonth).add(1, 'month').startOf('month').isAfter(dayjs(max), 'day');

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
          <select
            className={nativeSelect}
            value={currentYear}
            onChange={handleYearChange}
            aria-label="Vuosi"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            className={nativeSelect}
            value={currentMonth}
            onChange={handleMonthSelectChange}
            aria-label="Kuukausi"
          >
            {FINNISH_MONTHS.map((name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </select>
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

      {/* Grid */}
      {/*
        Mantine v8 Calendar uses 'YYYY-MM-DD' STRINGS, not Date objects:
        - `date` (controlled displayed month) is a string → format calendarMonth out
        - `onDateChange` hands back a string → parse it to a Date before bubbling up
        - the `date` argument to `getDayProps` is a string → compare via dayjs(string)
          and convert to a Date before calling onStagedDateChange
        All string↔Date conversion stays inside this component (see Global Constraints).
      */}
      <div className={calendarGrid}>
        <Calendar
          locale="fi"
          firstDayOfWeek={1}
          level="month"
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

            return {
              className: cx({
                [dayCellStaged]: isStaged,
                [dayCellToday]: isToday && !isStaged,
                [dayCellOutsideMonth]: isOutside,
                [dayCellDisabled]: isDisabled,
              }),
              disabled: isDisabled,
              'aria-pressed': isStaged,
              onClick: isDisabled ? undefined : () => onStagedDateChange(day.toDate()),
            };
          }}
        />
      </div>

      {/* Footer */}
      <div className={calendarFooter}>
        <Button variant="text" onClick={onToday}>
          {todayLabel}
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="filled" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
