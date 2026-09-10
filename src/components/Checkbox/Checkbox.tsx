import { Box, Flex } from '@mantine/core';
import cx from 'clsx';
import { type ComponentPropsWithoutRef, useEffect, useId, useRef, useState } from 'react';
import { CheckboxCheckedIcon } from '../../icons/CheckboxCheckedIcon';
import { CheckboxIndeterminateIcon } from '../../icons/CheckboxIndeterminateIcon';
import { CheckboxUncheckedIcon } from '../../icons/CheckboxUncheckedIcon';
import { icon, inner, input, inputLabel, root } from './Checkbox.css';

interface Props extends ComponentPropsWithoutRef<'input'> {
  label: string | React.ReactNode;
  error?: boolean;
  indeterminate?: boolean;
}

export function Checkbox({ label, error, indeterminate, defaultChecked, ...inputProps }: Props) {
  // Normalise the controlled prop once: `undefined` means uncontrolled, anything else is a
  // controlled value coerced to a real boolean. Both halves matter, and both have bitten already.
  //
  // Without the `undefined` check an uncontrolled caller — who never passes `checked` — would
  // make `undefined !== checked` true on every render and call `setChecked` in a loop (#122).
  //
  // Without the `!!`, a JS caller clearing a controlled value to `null` would put `null` in state
  // and on the native input, which React reads as *no* `checked` prop: the input silently stops
  // being controlled and React stops writing its value. Coercing the *comparison* as well as the
  // stored value is what keeps that from becoming a second render loop — a raw `null` prop is
  // never equal to the coerced `false` in state, so it would re-set forever.
  const controlledChecked = inputProps.checked === undefined ? undefined : !!inputProps.checked;

  // Seeded from the normalised value, so the state is a boolean from the very first render rather
  // than only from the first sync below.
  const [checked, setChecked] = useState(controlledChecked ?? !!defaultChecked);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep internal state in sync when the parent provides a controlled `checked` prop.
  if (controlledChecked !== undefined && controlledChecked !== checked) {
    setChecked(controlledChecked);
  }

  // The native `indeterminate` DOM property has no HTML attribute/JSX prop, so it must be set
  // imperatively. Re-assert on every commit (no dependency array): the browser's own click
  // activation steps clear it back to false, and that reset isn't reflected in the `indeterminate`
  // prop, so a dependency array would leave the DOM property silently desynced after a click.
  // This relies on `onClick` below toggling `checked` (forcing a re-render, and thus this effect,
  // after a click) — if that internal state is ever removed, this effect needs some other trigger
  // to re-run after a click (e.g. reasserting directly inside the click handler instead). A click
  // a caller vetoes with `preventDefault()` is the one case with no re-render, and needs none:
  // the browser's canceled-activation steps restore `indeterminate` along with `checked`.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  });

  // `defaultChecked` can't be forwarded as a prop: `checked` below always wins over it, so React
  // would only ever seed the input from `checked`. At mount that's harmless — React writes the
  // `checked` content attribute (what a form reset restores from) from the `checked` prop, and
  // this component seeds that prop from `defaultChecked`. What React skips is every *later*
  // change: it applies `defaultChecked` only while `checked` is absent, so without this effect a
  // `defaultChecked` that changes after mount would never reach the DOM, and the next form reset
  // would restore the stale value. Guarded on `!== undefined` so a controlled Checkbox — which
  // has no `defaultChecked` of its own — keeps the attribute React derived from `checked` instead
  // of having it cleared. Narrow deps are correct here, unlike the deliberately dep-less effect
  // above: nothing else writes this property, so it only needs re-applying when the prop changes.
  useEffect(() => {
    if (inputRef.current && defaultChecked !== undefined) {
      inputRef.current.defaultChecked = defaultChecked;
    }
  }, [defaultChecked]);

  // A form reset restores `input.checked` from that content attribute without telling React, so
  // the internal state (and the icon it renders) would keep showing the pre-reset value. Read the
  // input back afterwards rather than assuming a value: the `reset` event fires *before* the
  // browser restores control values, and another listener can still cancel it, so only the DOM
  // knows which way it went.
  //
  // The wait has to be a task, not a microtask. A listener invoked from a browser-originated
  // dispatch — i.e. a real user clicking the reset button — returns with an empty JS stack, so the
  // microtask checkpoint runs right there, still ahead of the form-reset algorithm. Called from JS
  // (`form.reset()`, or a synthetic click) the stack isn't empty and a microtask would have been
  // late enough, which is exactly why this needs a browser-driven test to stay honest — see the
  // form-reset stories.
  //
  // Listen on the document rather than on `inputRef.current.form`: `reset` bubbles, and form
  // membership follows the `form` attribute, so resolving the form once at subscribe time would
  // miss a Checkbox whose form mounts later or changes.
  useEffect(() => {
    const node = inputRef.current;
    if (!node) return;

    let pending: ReturnType<typeof setTimeout> | undefined;
    const syncAfterReset = (event: Event) => {
      if (event.target !== inputRef.current?.form) return;
      clearTimeout(pending);
      pending = setTimeout(() => {
        const input = inputRef.current;
        if (!input) return;
        if (controlledChecked !== undefined) {
          // Controlled: the parent owns the value, so restore the DOM from the prop rather than
          // letting a reset desync it from what the parent still believes is checked.
          input.checked = controlledChecked;
        } else {
          setChecked(input.checked);
        }
      }, 0);
    };

    const doc = node.ownerDocument;
    doc.addEventListener('reset', syncAfterReset);
    return () => {
      // The listener goes away here, but an already-scheduled callback would still run — with a
      // stale `controlledChecked` — and overwrite whatever the parent has since committed.
      clearTimeout(pending);
      doc.removeEventListener('reset', syncAfterReset);
    };
  }, [controlledChecked]);

  const uniqueId = useId();
  const safeId = inputProps.id ?? uniqueId;

  // Exactly one `data-*` attribute is emitted, so this ordering — not the CSS — is what resolves
  // a control in several states at once. `disabled` outranks `error`: a control the user cannot
  // interact with should read as inert rather than as something they are being asked to fix, and
  // the label below greys out on `disabled` unconditionally, so any other order would render the
  // control half-disabled (error-red icon, greyed label).
  const getInputVariant = () => {
    if (inputProps.disabled) return { 'data-disabled': true };
    if (error) return { 'data-error': true };
    if (indeterminate) return { 'data-indeterminate': true };
    if (checked) return { 'data-checked': true };
    return null;
  };

  const inputVariant = getInputVariant();

  return (
    <Flex className={root}>
      <Box className={inner}>
        <input
          {...inputProps}
          ref={inputRef}
          checked={checked}
          aria-checked={indeterminate ? 'mixed' : undefined}
          // The caller's handler runs first so it can veto the toggle with `preventDefault()`, the
          // standard native-checkbox pattern. Honouring the veto has to be explicit here because
          // the toggle is faked in this handler rather than left to the browser: the browser's
          // canceled-activation steps revert `input.checked` after this dispatch (and suppress the
          // native change event), so toggling anyway would leave React state and the DOM
          // permanently split — the icon checked, the input unchecked, the field missing from a
          // form submit — until some unrelated re-render happened to paper over it.
          onClick={(e) => {
            if (inputProps.onClick) {
              inputProps.onClick(e);
            }
            // Both flags, because they can disagree. `e.preventDefault()` sets the synthetic
            // event's own copy; `e.nativeEvent.preventDefault()` sets only the native one. Either
            // cancels the browser's activation, so either has to skip the toggle — reading just
            // the synthetic copy would let a native-event veto produce exactly the split state
            // described above.
            if (e.defaultPrevented || e.nativeEvent.defaultPrevented) return;
            setChecked(!checked);
          }}
          // Toggling happens in `onClick` above; this only exists so React's controlled-input
          // heuristic (which pairs `checked` with `onChange`, not `onClick`) doesn't log a
          // "checked without onChange" warning. Still forwards a caller's own `onChange` —
          // the explicit handler here shadows the one that would otherwise apply via the
          // `{...inputProps}` spread above. Note a caller wiring both `onClick` and `onChange`
          // will have both fire for the same interaction; that's expected, not a bug.
          onChange={(e) => {
            // A click the caller vetoed above changed nothing, so there is nothing to forward.
            // The browser fires no native change event for canceled activation, but React
            // synthesises `onChange` for checkboxes from the click event, so without this guard a
            // vetoed click would still report a change that never happened. Read the veto off the
            // native event: React copies `defaultPrevented` onto each synthetic event when it
            // constructs it — before any handler has run — so this synthetic event's own copy is
            // still false even though the click it came from was since prevented.
            if (e.nativeEvent.defaultPrevented) return;
            if (inputProps.onChange) {
              inputProps.onChange(e);
            }
          }}
          id={safeId}
          className={input}
          type="checkbox"
          {...inputVariant}
        />
        {indeterminate ? (
          <CheckboxIndeterminateIcon aria-hidden="true" className={icon} />
        ) : checked ? (
          <CheckboxCheckedIcon aria-hidden="true" className={icon} />
        ) : (
          <CheckboxUncheckedIcon aria-hidden="true" className={icon} />
        )}
      </Box>
      <label
        className={cx(root, inputLabel[inputProps.disabled ? 'disabled' : 'default'])}
        htmlFor={safeId}
      >
        {label}
      </label>
    </Flex>
  );
}
