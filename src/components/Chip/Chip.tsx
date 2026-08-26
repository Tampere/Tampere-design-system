import type { ReactElement, ReactNode } from 'react';
import cx from 'clsx';
import { Chip as MantineChip } from '@mantine/core';
import { CheckmarkIcon } from '../../icons/CheckmarkIcon';
import { CloseIcon } from '../../icons/CloseIcon';
import { IconButton } from '../IconButton/IconButton';
import {
  filterWrapper,
  filterRoot,
  filterLabel,
  filterLabelWithLeadingIcon,
  filterInput,
  filterIconOverlay,
  tagRoot,
  tagDismissIcon,
  chipIcon,
} from './Chip.css';

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

  // `onRemove?: never` still permits a filter-chip caller to explicitly pass
  // `onRemove: undefined`, and `in` returns true for a present-but-undefined
  // key — the `&& props.onRemove` truthy check is what actually discriminates
  // the union at runtime (see Table.tsx's TableRowSelection for the same
  // never-based pattern).
  if ('onRemove' in props && props.onRemove) {
    const { onRemove, removeLabel, icon } = props;
    return (
      <span className={cx(tagRoot, className)} data-disabled={disabled || undefined}>
        {icon && <span className={chipIcon}>{icon}</span>}
        {children}
        <IconButton size="sm" onClick={onRemove} disabled={disabled} aria-label={removeLabel}>
          <CloseIcon className={tagDismissIcon} />
        </IconButton>
      </span>
    );
  }

  const { checked, onChange, selectedIcon, icon } = props;
  const hasLeadingIcon = !checked && !!icon;

  const chip = (
    <MantineChip
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={hasLeadingIcon ? filterRoot : cx(filterRoot, className)}
      classNames={{
        label: cx(filterLabel, hasLeadingIcon && filterLabelWithLeadingIcon),
        input: filterInput,
        iconWrapper: chipIcon,
      }}
      icon={selectedIcon ?? <CheckmarkIcon />}
    >
      {children}
    </MantineChip>
  );

  if (!hasLeadingIcon) {
    return chip;
  }

  return (
    <span className={cx(filterWrapper, className)} data-disabled={disabled || undefined}>
      {chip}
      <span className={cx(chipIcon, filterIconOverlay)}>{icon}</span>
    </span>
  );
}
