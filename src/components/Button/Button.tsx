import { forwardRef, type PropsWithChildren } from 'react';
import cx from 'clsx';
import { Flex, UnstyledButton, type UnstyledButtonProps } from '@mantine/core';
import { variants, pill, iconOnly as iconOnlyStyle, content, iconWrapper } from './Button.css.ts';

export interface ButtonProps extends PropsWithChildren, UnstyledButtonProps, React.AriaAttributes {
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Corner shape. `'pill'` = fully rounded ends, matching Figma's `Corner-radius: Rounded` variant. */
  radius?: 'sharp' | 'pill';
  /**
   * Uniform padding on all sides (Figma's `Icon-only: Yes` variant) instead of the wider
   * horizontal padding a labeled button uses. Always pair with an `aria-label`.
   */
  iconOnly?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/** A basic button components with variants. Remember to include aria-label for accessibility if no text is provided as children. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      radius = 'sharp',
      iconOnly = false,
      children,
      disabled,
      leftIcon,
      rightIcon,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <UnstyledButton
        ref={ref}
        {...props}
        onClick={onClick}
        disabled={disabled}
        className={cx(
          variants[variant],
          radius === 'pill' && pill,
          iconOnly && iconOnlyStyle,
          props.className
        )}
      >
        <Flex component="span" className={content}>
          {leftIcon && <span className={iconWrapper}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={iconWrapper}>{rightIcon}</span>}
        </Flex>
      </UnstyledButton>
    );
  }
);

Button.displayName = 'Button';
