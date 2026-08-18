import { forwardRef } from 'react';
import cx from 'clsx';
import { UnstyledButton, type UnstyledButtonProps } from '@mantine/core';
import { root, iconWrapper, label as labelStyle, variants } from './LabeledIconButton.css.ts';

export interface LabeledIconButtonProps
  extends
    Omit<UnstyledButtonProps, 'children'>,
    // Excludes 'aria-label'/'aria-labelledby' — the visible `label` prop
    // below is always this component's accessible name, and letting a
    // consumer pass either would silently override that invariant.
    Omit<React.AriaAttributes, 'aria-label' | 'aria-labelledby'> {
  icon: React.ReactNode;
  label: string;
  variant?: 'light' | 'dark';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const LabeledIconButton = forwardRef<HTMLButtonElement, LabeledIconButtonProps>(
  ({ icon, label, variant = 'light', disabled, onClick, className, ...props }, ref) => {
    return (
      <UnstyledButton
        ref={ref}
        {...props}
        onClick={onClick}
        disabled={disabled}
        className={cx(root, variants[variant], className)}
      >
        <span className={iconWrapper}>{icon}</span>
        <span className={labelStyle}>{label}</span>
      </UnstyledButton>
    );
  }
);

LabeledIconButton.displayName = 'LabeledIconButton';
