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

export function Checkbox({ label, error, indeterminate, ...inputProps }: Props) {
  const [checked, setChecked] = useState(inputProps.checked ?? false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep internal state in sync when the parent provides a controlled `checked` prop.
  if (inputProps.checked !== checked) {
    setChecked(!!inputProps.checked);
  }

  // The native `indeterminate` DOM property has no HTML attribute/JSX prop, so it must be set
  // imperatively. Re-assert on every commit (no dependency array): the browser's own click
  // activation steps clear it back to false, and that reset isn't reflected in the `indeterminate`
  // prop, so a dependency array would leave the DOM property silently desynced after a click.
  // This relies on `onClick` below always toggling `checked` (forcing a re-render, and thus this
  // effect, on every click) — if that internal state is ever removed, this reassertion needs to
  // move to the click handler itself instead.
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
