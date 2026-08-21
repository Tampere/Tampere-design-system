import type { ReactElement, ReactNode } from 'react';
import cx from 'clsx';
import { Chip as MantineChip } from '@mantine/core';
import { StepCheckIcon } from '../../icons/StepCheckIcon';
import { CloseIcon } from '../../icons/CloseIcon';
import { IconButton } from '../IconButton/IconButton';
import { filterRoot, filterLabel, filterInput, tagRoot, tagDismissIcon } from './Chip.css';

export interface ChipCommonProps {
  children: ReactNode;
  icon?: ReactElement;
  disabled?: boolean;
  className?: string;
}

export interface ChipFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  selectedIcon?: ReactElement;
  onRemove?: never;
  removeLabel?: never;
}

export interface ChipTagProps {
  onRemove: () => void;
  removeLabel: string;
  checked?: never;
  onChange?: never;
  selectedIcon?: never;
}

export type ChipProps = ChipCommonProps & (ChipFilterProps | ChipTagProps);

export function Chip(props: ChipProps) {
  const { children, disabled, className } = props;

  if ('onRemove' in props && props.onRemove) {
    const { onRemove, removeLabel, icon } = props as ChipCommonProps & ChipTagProps;
    return (
      <span className={cx(tagRoot, className)} data-disabled={disabled || undefined}>
        {icon}
        {children}
        <IconButton size="xs" onClick={onRemove} disabled={disabled} aria-label={removeLabel}>
          <CloseIcon className={tagDismissIcon} />
        </IconButton>
      </span>
    );
  }

  const { checked, onChange, selectedIcon, icon } = props as ChipCommonProps & ChipFilterProps;

  return (
    <MantineChip
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={cx(filterRoot, className)}
      classNames={{ label: filterLabel, input: filterInput }}
      icon={selectedIcon ?? <StepCheckIcon />}
    >
      {!checked && icon}
      {children}
    </MantineChip>
  );
}
