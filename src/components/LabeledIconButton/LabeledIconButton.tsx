import { forwardRef } from 'react';
import cx from 'clsx';
import { Flex, UnstyledButton, type UnstyledButtonProps } from '@mantine/core';
import { root, iconWrapper, label as labelStyle, variants } from './LabeledIconButton.css.ts';

export interface LabeledIconButtonProps extends Omit<UnstyledButtonProps, 'children'> {
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
        <Flex direction="column" align="center" className={iconWrapper}>
          {icon}
        </Flex>
        <span className={labelStyle}>{label}</span>
      </UnstyledButton>
    );
  }
);

LabeledIconButton.displayName = 'LabeledIconButton';
