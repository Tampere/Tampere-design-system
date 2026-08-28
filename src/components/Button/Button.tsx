import { forwardRef, type PropsWithChildren } from 'react';
import cx from 'clsx';
import { Flex, UnstyledButton, type UnstyledButtonProps } from '@mantine/core';
import { variants, pill, iconOnly as iconOnlyStyle, content, iconWrapper } from './Button.css.ts';

type ButtonBaseProps = PropsWithChildren<UnstyledButtonProps> &
  React.AriaAttributes & {
    variant?: 'primary' | 'secondary' | 'tertiary';
    /**
     * Corner shape. `'pill'` = fully rounded ends, matching Figma's `Corner-radius: Rounded`
     * variant. Not narrowed per `variant` — `pill` is a deliberate no-op on `tertiary` (see
     * Button.css.ts), a CSS-level tradeoff rather than a type-level one.
     */
    radius?: 'sharp' | 'pill';
    disabled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  };

// `iconOnly` has no visible text, so an accessible name can't come from `children` —
// require `aria-label` at compile time rather than only documenting it, using the
// same discriminated-union technique as Chip.tsx to make a prop conditionally required.
export type ButtonProps =
  | (ButtonBaseProps & {
      /**
       * Uniform padding on all sides (Figma's `Icon-only: Yes` variant) instead of the
       * wider horizontal padding a labeled button uses. Requires `aria-label`, since
       * there's no visible text to derive an accessible name from.
       */
      iconOnly: true;
      'aria-label': string;
    })
  | (ButtonBaseProps & { iconOnly?: false });

/** A basic button component with variants. `aria-label` is required — and compiler-enforced — when `iconOnly` is set, since there's no visible text to derive an accessible name from. */
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
