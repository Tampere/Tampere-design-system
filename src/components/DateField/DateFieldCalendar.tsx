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
