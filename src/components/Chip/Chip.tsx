import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
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

export interface ChipCommonProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'checked' | 'onChange' | 'disabled' | 'children' | 'className' | 'type' | 'size'
> {
  children: ReactNode;
  /**
   * Leading icon. On a filter chip this only renders while `checked` is
   * `false` — it is replaced by the checkmark/`selectedIcon` once selected,
   * so passing both `checked` and `icon` together silently drops `icon`.
   */
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
  // `onRemove?: never` still permits a filter-chip caller to explicitly pass
  // `onRemove: undefined`, and `in` returns true for a present-but-undefined
  // key — the `&& props.onRemove` truthy check is what actually discriminates
  // the union at runtime (see Table.tsx's TableRowSelection for the same
  // never-based pattern).
  if ('onRemove' in props && props.onRemove) {
    const { onRemove, removeLabel, icon, children, disabled, className, ...rest } = props;
    return (
      <span className={cx(tagRoot, className)} data-disabled={disabled || undefined} {...rest}>
        {icon && <span className={chipIcon}>{icon}</span>}
        {children}
        <IconButton size="sm" onClick={onRemove} disabled={disabled} aria-label={removeLabel}>
          <CloseIcon className={tagDismissIcon} />
        </IconButton>
      </span>
    );
  }

  const { checked, onChange, selectedIcon, icon, children, disabled, className, ...rest } = props;
  const hasLeadingIcon = !checked && !!icon;

  // Always rendered as a wrapper `<span>` around `MantineChip` — even when
  // there's no leading icon to overlay — so the root element type never
  // changes between checked/unchecked. Conditionally swapping between this
  // wrapper and the bare `MantineChip` (a `<div>`) made React unmount and
  // remount the whole subtree, including the `<input>`, on every toggle,
  // dropping keyboard focus.
  return (
    <span className={cx(filterWrapper, className)} data-disabled={disabled || undefined}>
      <MantineChip
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={filterRoot}
        classNames={{
          label: cx(filterLabel, hasLeadingIcon && filterLabelWithLeadingIcon),
          input: filterInput,
          iconWrapper: chipIcon,
        }}
        icon={selectedIcon ?? <CheckmarkIcon />}
        {...rest}
      >
        {children}
      </MantineChip>
      {hasLeadingIcon && <span className={cx(chipIcon, filterIconOverlay)}>{icon}</span>}
    </span>
  );
}
