import { type ComponentPropsWithoutRef, useId, useState } from 'react';
import cx from 'clsx';
import { Box, Flex } from '@mantine/core';
import { CheckboxCheckedIcon } from '../../icons/CheckboxCheckedIcon';
import { CheckboxUncheckedIcon } from '../../icons/CheckboxUncheckedIcon';
import { root, input, icon, inner, inputLabel } from './Checkbox.css';

interface Props extends ComponentPropsWithoutRef<'input'> {
  label: string | React.ReactNode;
}

export function Checkbox({ label, ...inputProps }: Props) {
  const [checked, setChecked] = useState(inputProps.checked ?? false);

  // Keep internal state in sync when the parent provides a controlled `checked` prop.
  if (inputProps.checked !== checked) {
    setChecked(!!inputProps.checked);
  }

  const uniqueId = useId();
  const safeId = inputProps.id ?? uniqueId;

  return (
    <Flex className={root}>
      <Box className={inner}>
        {checked ? (
          <CheckboxCheckedIcon aria-hidden="true" className={icon} />
        ) : (
          <CheckboxUncheckedIcon aria-hidden="true" className={icon} />
        )}
        <input
          {...inputProps}
          checked={checked}
          onClick={(e) => {
            setChecked(!checked);
            if (inputProps.onClick) {
              inputProps.onClick(e);
            }
          }}
          id={safeId}
          className={input}
          type="checkbox"
        />
      </Box>
      <label className={cx(root, inputLabel)} htmlFor={safeId}>
        {label}
      </label>
    </Flex>
  );
}
