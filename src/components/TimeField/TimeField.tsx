import { useEffect, useRef, useState } from 'react';
import cx from 'clsx';
import { TextField } from '../TextField';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { TimeIcon } from '../../icons/TimeIcon';
import { CloseIcon } from '../../icons/CloseIcon';
import { timeInput, triggerIcon } from './TimeField.css';

export interface TimeFieldClassNames {
  root: string;
  input: string;
  pickerButton: string;
}

export interface TimeFieldProps {
  /** Committed time as "HH:mm", or '' when empty. Omit for an uncontrolled field. */
  value?: string;
  /** Initial time for an uncontrolled field. Ignored when `value` is supplied. */
  defaultValue?: string;
  /** Called with "HH:mm", or '' when cleared. */
  onChange?: (time: string) => void;
  /** Visible field label. Provide this, `aria-label`, or `aria-labelledby`. */
  inputLabel?: string;
  /** Accessible name for the clock trigger. Required — no default. */
  pickerButtonLabel: string;
  /** Accessible name for the clear (✕) button. Default: Finnish. */
  clearButtonLabel?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  helperText?: React.ReactNode;
  /** Consumer-supplied error. Takes precedence over internal range validation. */
  error?: string;
  /** Shown when the time falls outside [min, max] or off `step`. Default: Finnish. */
  outOfRangeError?: string;
  /** Earliest selectable time, "HH:mm". */
  min?: string;
  /** Latest selectable time, "HH:mm". */
  max?: string;
  /**
   * Granularity in seconds; clamped to the nearest whole minute (minimum 60). Default 60.
   * Enforced relative to `min` — Chromium does not evaluate `step` without a `min` present, so
   * if `step` is supplied and `min` is not, `min` defaults to `'00:00'` (the earliest
   * representable time, so this excludes no values) purely to switch on step enforcement.
   */
  step?: number;
  disabled?: boolean;
  required?: boolean;
  classNames?: Partial<TimeFieldClassNames>;
}

/** A time-entry field: a TREDS text input in native `time` mode. */
export function TimeField({
  value,
  defaultValue,
  onChange,
  inputLabel,
  pickerButtonLabel,
  clearButtonLabel = 'Tyhjennä kellonaika',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  helperText,
  error,
  outOfRangeError = 'Kellonaika on sallitun välin ulkopuolella',
  min,
  max,
  step: stepProp,
  disabled,
  required,
  classNames,
}: TimeFieldProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = isControlled ? value : internalValue;
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  const [rangeError, setRangeError] = useState(false);
  const step = stepProp ?? 60;

  // A step that isn't a whole number of minutes makes the browser render a
  // seconds segment, which this component does not support — round to the
  // nearest minute (and never below one) rather than merely flooring at 60,
  // otherwise e.g. `step={90}` would slip through unchanged.
  const effectiveStep = Math.max(60, Math.round(step / 60) * 60);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && step !== effectiveStep) {
      console.error(
        `TimeField: \`step\` must be a whole number of minutes — got ${step}, using ${effectiveStep}.`
      );
    }
  }, [step, effectiveStep]);

  // Chromium never evaluates `stepMismatch` on a time input without a `min`
  // present (verified empirically, not documented behaviour) — so a `step`
  // given without a `min` would otherwise enforce nothing at all. Default to
  // the earliest representable time, which excludes no values, purely to
  // switch step enforcement on. Only when the consumer actually asked for a
  // `step`: fields that never set `step` get no implicit `min`.
  const effectiveMin = min ?? (stepProp !== undefined ? '00:00' : undefined);

  const showClear = !disabled && currentValue !== '';

  // Revalidate off the native input's own `validity` object whenever anything
  // that could change it does — not just user-driven change/blur events, but
  // also a controlled consumer resetting `value`, or `min`/`max`/`step`
  // themselves changing under an already-displayed value. This single effect
  // subsumes what would otherwise be duplicate validate() calls wired to
  // onChange and onBlur.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const { rangeUnderflow, rangeOverflow, stepMismatch } = input.validity;
    setRangeError(rangeUnderflow || rangeOverflow || stepMismatch);
  }, [currentValue, effectiveMin, max, effectiveStep]);

  const shownError = error ?? (rangeError ? outOfRangeError : undefined);

  function handleClear() {
    if (!isControlled) setInternalValue('');
    onChange?.('');
    // The ✕ disappears once the field is empty, so move focus to the adjacent
    // picker trigger rather than letting it fall back to <body>.
    requestAnimationFrame(() => pickerButtonRef.current?.focus());
  }

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;
    // Feature-detect first (Safari <16 has no showPicker), then guard the call:
    // Chromium throws NotAllowedError without user activation and
    // InvalidStateError on a disabled/hidden input. Focusing keeps the button
    // from being an inert control in any of those cases.
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
        // fall through to focus
      }
    }
    input.focus();
  }

  // Dev-only guard: without a visible label or an aria-label/aria-labelledby the
  // time input has no accessible name.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !inputLabel && !ariaLabel && !ariaLabelledby) {
      console.error(
        'TimeField: provide `inputLabel`, `aria-label` or `aria-labelledby` — the input has no accessible name otherwise.'
      );
    }
  }, [inputLabel, ariaLabel, ariaLabelledby]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.value;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <TextField
      type="time"
      ref={inputRef}
      inputLabel={inputLabel}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      helperText={helperText}
      error={shownError}
      disabled={disabled}
      required={required}
      value={currentValue}
      onChange={handleChange}
      min={effectiveMin}
      max={max}
      step={effectiveStep}
      // Drives the empty-segment placeholder colour in TimeField.css.ts: the
      // `-webkit-datetime-edit-*` shadow pseudo-elements don't support
      // `:not([attr])` matching in Chromium, so component state (not an
      // attribute the browser itself sets) has to signal "every segment is
      // still `--`".
      data-empty={currentValue === '' ? 'true' : undefined}
      classNames={{ root: classNames?.root, input: cx(timeInput, classNames?.input) }}
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
          ref={pickerButtonRef}
          variant="primary"
          iconOnly
          aria-label={pickerButtonLabel}
          disabled={disabled}
          onClick={openPicker}
          className={classNames?.pickerButton}
        >
          <TimeIcon className={triggerIcon} />
        </Button>
      }
    />
  );
}
