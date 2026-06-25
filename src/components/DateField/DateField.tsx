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
