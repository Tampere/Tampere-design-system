import type { PropsWithChildren } from 'react';
import cx from 'clsx';
import { Flex, UnstyledButton, type UnstyledButtonProps } from '@mantine/core';
import { variants, content } from './Button.css.ts';

interface Props extends PropsWithChildren, UnstyledButtonProps {
  variant?: 'filled' | 'outlined' | 'text';
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/** A basic button components with variants. Remember to include aria-label for accessibility if no text is provided as children. */
export function Button({
  variant = 'filled',
  children,
  disabled,
  leftIcon,
  rightIcon,
  onClick,
  ...props
}: Props) {
  return (
    <UnstyledButton
      {...props}
      onClick={onClick}
      disabled={disabled}
      className={cx(variants[variant], props.className)}
    >
      <Flex component="span" className={content}>
        {leftIcon && leftIcon}
        {children}
        {rightIcon && rightIcon}
      </Flex>
    </UnstyledButton>
  );
}
