import { useCallback, useEffect, useRef, useState } from 'react';
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
  label?: string;
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
  /**
   * Shown when the segments hold an incomplete time (e.g. an hour with no
   * minutes). The native input reports this as `badInput` and keeps its own
   * value empty, so without this the entry is discarded silently. Default: Finnish.
   */
  invalidTimeError?: string;
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
  label,
  pickerButtonLabel,
  clearButtonLabel = 'Tyhjennä kellonaika',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  helperText,
  error,
  outOfRangeError = 'Kellonaika on sallitun välin ulkopuolella',
  invalidTimeError = 'Anna kellonaika muodossa tunnit:minuutit',
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
  const [validity, setValidity] = useState({
    incomplete: false,
    outOfRange: false,
    stepMismatch: false,
  });
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

  // Read the flags straight off the native input rather than reimplementing
  // range/step arithmetic. `badInput` is separated from the range flags because
  // it means something different to the user (incomplete entry, not a value
  // outside the allowed window) and needs its own message.
  const revalidate = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      // The ref is the only route to `validity`; losing it would silently
      // disable every range and step check for the lifetime of the component.
      if (process.env.NODE_ENV !== 'production') {
        console.error('TimeField: input ref is not attached — validation is inactive.');
      }
      return;
    }
    const { rangeUnderflow, rangeOverflow, stepMismatch, badInput } = input.validity;
    setValidity({
      incomplete: badInput,
      outOfRange: rangeUnderflow || rangeOverflow,
      stepMismatch,
    });
  }, []);

  // Covers every input that can move the range and step flags: the value, and
  // `min`/`max`/`step` themselves changing under an already-displayed value.
  // `badInput` cannot be observed this way — half-filling an *empty* field
  // changes no value and fires no event — which is why `onBlur` also
  // revalidates. If you read another validity flag here, check whether an
  // effect can actually see it flip.
  useEffect(revalidate, [revalidate, currentValue, effectiveMin, max, effectiveStep]);

  // Consumer error first, then incomplete entry (the user can't fix a range
  // problem they haven't finished typing), then the range window.
  const shownError =
    error ??
    (validity.incomplete
      ? invalidTimeError
      : validity.outOfRange || validity.stepMismatch
        ? outOfRangeError
        : undefined);

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
    if (process.env.NODE_ENV !== 'production' && !label && !ariaLabel && !ariaLabelledby) {
      console.error(
        'TimeField: provide `label`, `aria-label` or `aria-labelledby` — the input has no accessible name otherwise.'
      );
    }
  }, [label, ariaLabel, ariaLabelledby]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.value;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  function handleBlur() {
    revalidate();
  }

  // Forward an aria-label/aria-labelledby only when there is no visible label,
  // so it can't silently override a visible label's accessible name.
  const inputAriaProps =
    !label && (ariaLabel || ariaLabelledby)
      ? { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby }
      : {};

  return (
    <TextField
      type="time"
      ref={inputRef}
      inputLabel={label}
      {...inputAriaProps}
      helperText={helperText}
      error={shownError}
      disabled={disabled}
      required={required}
      value={currentValue}
      onChange={handleChange}
      onBlur={handleBlur}
      min={effectiveMin}
      max={max}
      step={effectiveStep}
      // Drives the empty-segment placeholder colour in TimeField.css.ts: the
      // `-webkit-datetime-edit-*` shadow pseudo-elements can't be qualified by
      // an attribute selector, so component state has to signal "nothing is
      // entered". A partially-filled field (`09:--`) is deliberately NOT empty
      // — its typed segment should render in the normal text colour.
      data-empty={currentValue === '' && !validity.incomplete ? 'true' : undefined}
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
