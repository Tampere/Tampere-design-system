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
  // This relies on `onClick` below always toggling `checked` (forcing a re-render, and thus this
  // effect, on every click) — if that internal state is ever removed, this effect needs some other
  // trigger to re-run after a click (e.g. reasserting directly inside the click handler instead).
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  });

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
          onClick={(e) => {
            setChecked(!checked);
            if (inputProps.onClick) {
              inputProps.onClick(e);
            }
          }}
          // Toggling happens in `onClick` above; this only exists so React's controlled-input
          // heuristic (which pairs `checked` with `onChange`, not `onClick`) doesn't log a
          // "checked without onChange" warning. Still forwards a caller's own `onChange` —
          // the explicit handler here shadows the one that would otherwise apply via the
          // `{...inputProps}` spread above. Note a caller wiring both `onClick` and `onChange`
          // will have both fire for the same interaction; that's expected, not a bug.
          onChange={(e) => {
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
