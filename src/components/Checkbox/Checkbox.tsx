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
  const [checked, setChecked] = useState(inputProps.checked ?? defaultChecked ?? false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep internal state in sync when the parent provides a controlled `checked` prop. Guarded
  // on `!== undefined`: an uncontrolled caller never passes `checked`, so without this guard
  // `undefined !== checked` would be true on every render, calling `setChecked` in a loop.
  if (inputProps.checked !== undefined && inputProps.checked !== checked) {
    setChecked(inputProps.checked);
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

  // `defaultChecked` is deliberately not forwarded as a prop: React rejects it alongside the
  // `checked` prop below and drops it with a warning. Setting the DOM property writes the
  // `checked` content attribute instead, which is what the browser restores from on form reset.
  // Without it `input.defaultChecked` stays false, so resetting a form silently unchecks a
  // `defaultChecked` Checkbox — dropping it from the submitted data.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.defaultChecked = !!defaultChecked;
    }
  }, [defaultChecked]);

  // A form reset restores `input.checked` from that content attribute without telling React, so
  // the internal state (and the icon it renders) would keep showing the pre-reset value. Read the
  // input back after the reset instead of assuming a value: the `reset` event fires *before* the
  // browser restores control values, and another listener can still cancel it — at microtask time
  // the DOM already reflects whichever way that went.
  const controlledChecked = inputProps.checked;
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;

    const syncAfterReset = () => {
      queueMicrotask(() => {
        const node = inputRef.current;
        if (!node) return;
        if (controlledChecked !== undefined) {
          // Controlled: the parent owns the value, so restore the DOM from the prop rather than
          // letting a reset desync it from what the parent still believes is checked.
          node.checked = controlledChecked;
        } else {
          setChecked(node.checked);
        }
      });
    };

    form.addEventListener('reset', syncAfterReset);
    return () => form.removeEventListener('reset', syncAfterReset);
  }, [controlledChecked]);

  const uniqueId = useId();
  const safeId = inputProps.id ?? uniqueId;

  const getInputVariant = () => {
    if (error) return { 'data-error': true };
    if (inputProps.disabled) return { 'data-disabled': true };
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
            if (e.defaultPrevented) return;
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
