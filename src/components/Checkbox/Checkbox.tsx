import { Box, Flex } from '@mantine/core';
import cx from 'clsx';
import { root, input, icon, inner, inputLabel } from './Checkbox.css';

import { type ComponentPropsWithoutRef, useId, useState } from 'react';
import { CheckboxCheckedIcon } from 'src/icons/CheckboxCheckedIcon';
import { CheckboxUncheckedIcon } from 'src/icons/CheckboxUncheckedIcon';

interface Props extends ComponentPropsWithoutRef<'input'> {
  label: string | React.ReactNode;
}

export function Checkbox({ label, ...inputProps }: Props) {
  const [checked, setChecked] = useState(inputProps.checked ?? false);

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
