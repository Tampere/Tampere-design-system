import { useCallback, useEffect, useRef, useState } from 'react';
import cx from 'clsx';
import { TextField } from '../TextField';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { TimeIcon } from '../../icons/TimeIcon';
import { CloseIcon } from '../../icons/CloseIcon';
import { timeInput, triggerIcon } from './TimeField.css';

/** Zero-padded 24-hour "HH:mm" — the only shape the native time input accepts. */
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface TimeFieldClassNames {
  root: string;
  input: string;
  pickerButton: string;
}

export interface TimeFieldProps extends Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  // Pure passthrough props: none of them can break the a11y wiring or the
  // segment styling, and `name` is what makes the field submit at all. The
  // set stays explicit rather than extending InputHTMLAttributes wholesale,
  // which would reopen `type`, widen min/max/step, and hand out `className`.
  'name' | 'id' | 'autoComplete' | 'onFocus' | 'onBlur'
> {
  /** Committed time as "HH:mm", or '' when empty. Omit for an uncontrolled field. */
  value?: string;
  /** Initial time for an uncontrolled field. Ignored when `value` is supplied. */
  defaultValue?: string;
  /**
   * Called with "HH:mm", or '' when cleared. Also called with '' while editing
   * a segment of an otherwise-complete value (e.g. clearing the minutes of
   * "09:30"), because the native input genuinely holds no time at that point.
   * Unlike `DateField`, which keeps the last committed value and never fires
   * `onChange(null)` mid-edit, TimeField commits the transient `''`.
   */
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
  /**
   * Consumer-supplied error. Takes precedence over the internal range,
   * step-mismatch, and incomplete-entry messages. An empty string still
   * counts as a supplied error and suppresses all of them, so avoid the
   * common `error={errors.time ?? ''}` idiom — pass `undefined` (not `''`)
   * when there is no consumer error, e.g. `error={errors.time}`.
   */
  error?: string;
  /** Shown when the time falls outside [min, max]. Default: Finnish. */
  outOfRangeError?: string;
  /**
   * Shown when the time is inside [min, max] but off the `step` grid. Kept
   * separate from `outOfRangeError` because "outside the allowed range" is
   * wrong and unactionable for a granularity problem. Default: Finnish.
   */
  stepMismatchError?: string;
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
   * Granularity in **minutes**; rounded to a whole minute, minimum 1. Default 1.
   * Named for its unit because the underlying `<input type="time">` measures
   * `step` in seconds, and this component supports no sub-minute granularity —
   * a seconds-unit prop that only accepts multiples of 60 would invite a
   * factor-of-60 mistake for nothing.
   *
   * Enforced relative to `min`: if `stepMinutes` is supplied and `min` is not,
   * `min` defaults to `'00:00'` so that `stepMismatch` is observable at all —
   * without a `min`, the step check is never true for typed or programmatic
   * values alike (see the comment on `effectiveMin`). `'00:00'` excludes no
   * values on a 24-hour clock.
   */
  stepMinutes?: number;
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
  stepMismatchError = 'Valitse kellonaika sallitulla tarkkuudella',
  invalidTimeError = 'Anna kellonaika muodossa tunnit:minuutit',
  min,
  max,
  stepMinutes: stepMinutesProp,
  disabled,
  required,
  classNames,
  name,
  id,
  autoComplete,
  onFocus,
  onBlur,
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
  const stepMinutes = stepMinutesProp ?? 1;

  // A step that isn't a whole number of minutes makes the browser render a
  // seconds segment, which this component does not support, so round to the
  // nearest minute and never go below one. `Number.isFinite` first: without it
  // `Math.round(NaN)` keeps NaN all the way into the DOM attribute (and into a
  // self-contradictory "got NaN, using NaN" warning), while `Infinity` compares
  // equal to itself and would slip through with no warning at all.
  const effectiveStepMinutes = Number.isFinite(stepMinutes)
    ? Math.max(1, Math.round(stepMinutes))
    : 1;
  // The DOM attribute is in seconds; the prop is in minutes.
  const domStep = effectiveStepMinutes * 60;
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && stepMinutes !== effectiveStepMinutes) {
      console.error(
        `TimeField: \`stepMinutes\` must be a whole number of minutes, at least 1 — got ${stepMinutes}, using ${effectiveStepMinutes}.`
      );
    }
  }, [stepMinutes, effectiveStepMinutes]);

  // Correct a swapped pair, the way DateField.tsx does: left alone, `min="17:00"
  // max="08:00"` makes every value in the intended window report an error while
  // every value outside it passes, with nothing pointing at the swapped props.
  // Only well-formed bounds are compared — the browser ignores an unparseable
  // min/max, so swapping on one would invent a range the browser never had (the
  // dev guard further down warns about those separately). "HH:mm" is zero-padded
  // and fixed-width, so a plain string comparison is a time comparison.
  const boundsSwapped = !!min && !!max && TIME_RE.test(min) && TIME_RE.test(max) && max < min;
  const rangeMin = boundsSwapped ? max : min;
  const rangeMax = boundsSwapped ? min : max;

  // Per the HTML step-base algorithm, `step` is measured from `min` if present,
  // otherwise from the `value` *content attribute*, otherwise from 0. React keeps
  // a controlled input's value content attribute in sync with the `value` prop on
  // every commit (`setDefaultValue`), so with no `min` the step base always equals
  // the current value — meaning `stepMismatch` can never be true by the time this
  // component's post-commit effect reads it, for typed and programmatic values
  // alike. An explicit `min` pins the step base instead; `'00:00'` excludes no
  // values, since `min` is inclusive. Only when the consumer actually asked for a
  // step: fields that never set `stepMinutes` get no implicit `min`. Reads
  // `rangeMin`, not `min`, so a swapped pair pins the step base to the corrected
  // lower bound rather than to the upper one.
  // Counterfactual test: OffGridControlledValueIsFlaggedAtMount.
  const effectiveMin = rangeMin ?? (stepMinutesProp !== undefined ? '00:00' : undefined);

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
  useEffect(revalidate, [revalidate, currentValue, effectiveMin, rangeMax, domStep]);

  // Consumer error first, then incomplete entry (the user can't fix a range
  // problem they haven't finished typing), then the range window, then
  // granularity — each with the message that actually names the problem.
  const shownError =
    error ??
    (validity.incomplete
      ? invalidTimeError
      : validity.outOfRange
        ? outOfRangeError
        : validity.stepMismatch
          ? stepMismatchError
          : undefined);

  const [clearRequests, setClearRequests] = useState(0);
  const handledClearRequest = useRef(0);

  function handleClear() {
    if (!isControlled) setInternalValue('');
    onChange?.('');
    // Only *request* the focus move; the effect below decides whether it happened.
    setClearRequests((n) => n + 1);
  }

  // The ✕ unmounts the moment the field empties, so focus would otherwise fall
  // back to <body> — move it to the adjacent picker trigger. Conditional on the
  // value having actually emptied: a controlled consumer that ignores `onChange`
  // keeps both the value and the ✕, and moving focus there would be the visible
  // half of an action that did nothing. Keyed on the click counter rather than on
  // the value alone, because an ignored clear re-renders nothing to observe; the
  // ref then marks the request consumed either way, so a later manual emptying
  // (deleting the segments by hand) can't inherit a stale focus move.
  useEffect(() => {
    if (clearRequests === handledClearRequest.current) return;
    handledClearRequest.current = clearRequests;
    if (currentValue === '') pickerButtonRef.current?.focus();
  }, [clearRequests, currentValue]);

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

  // Dev-only guard: the native input silently discards a time string it can't
  // parse. For `value`/`defaultValue` that means an empty-looking field while
  // the consumer believes a value is set; for `min`/`max` it means the
  // attribute is ignored, which disables the range check AND — since the
  // `'00:00'` fallback only fires when `min` is `undefined` — step enforcement
  // along with it. Warn rather than sanitize: a controlled field must render
  // what it was given, and the bug belongs to the caller.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const entries: [string, string | undefined][] = [
      ['value', value],
      ['defaultValue', defaultValue],
      ['min', min],
      ['max', max],
    ];
    for (const [name, candidate] of entries) {
      if (candidate !== undefined && candidate !== '' && !TIME_RE.test(candidate)) {
        console.error(
          `TimeField: \`${name}\` must be "HH:mm" (zero-padded, 24-hour) — got "${candidate}". ` +
            'The browser ignores unparseable values, so this silently does nothing.'
        );
      }
    }
    // Normalising a swapped pair keeps the field usable, but the props are still
    // wrong — say so, or the caller never finds out.
    if (boundsSwapped) {
      console.error(
        `TimeField: \`min\` ("${min}") is after \`max\` ("${max}") — using the pair the other way round.`
      );
    }
  }, [value, defaultValue, min, max, boundsSwapped]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.value;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    // Revalidate first so a consumer reading the DOM in their own handler sees
    // the settled state, then hand the event on.
    revalidate();
    onBlur?.(event);
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
      onFocus={onFocus}
      onBlur={handleBlur}
      name={name}
      id={id}
      autoComplete={autoComplete}
      min={effectiveMin}
      max={rangeMax}
      step={domStep}
      // Drives the empty-segment placeholder colour in TimeField.css.ts: the
      // `-webkit-datetime-edit-*` shadow pseudo-elements can't be qualified by
      // an attribute selector, so component state has to signal "nothing is
      // entered". A partially-filled field (`09:--`) stops counting as empty
      // once the entry settles on blur. While it's still being typed, though,
      // half-filling an empty field fires no event — `validity.incomplete`
      // stays `false`, so `data-empty` stays `'true'` and the whole edit
      // region, typed digits included, stays in the placeholder colour until
      // blur revalidates.
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
