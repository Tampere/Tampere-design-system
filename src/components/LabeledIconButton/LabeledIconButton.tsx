import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import cx from 'clsx';
import { UnstyledButton, type UnstyledButtonProps } from '@mantine/core';
import { root, iconWrapper, label as labelStyle, variants } from './LabeledIconButton.css.ts';

export interface LabeledIconButtonProps
  extends
    Omit<UnstyledButtonProps, 'children'>,
    // Excludes 'aria-label'/'aria-labelledby' — the visible `label` prop
    // below is always this component's accessible name, and letting a
    // consumer pass either would silently override that invariant. Note this
    // Omit only blocks typed object construction: TS exempts hyphenated JSX
    // attribute names from excess-property checks, so a JSX call site would
    // still compile past it — the runtime strip below is what actually
    // enforces the invariant.
    // 'style' is dropped here — UnstyledButtonProps (via Mantine's Box)
    // already declares it with a different (CSS-variable-friendly) type, and
    // intersecting both would conflict.
    Omit<
      ComponentPropsWithoutRef<'button'>,
      'children' | 'style' | 'aria-label' | 'aria-labelledby'
    > {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'inverted';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const LabeledIconButton = forwardRef<HTMLButtonElement, LabeledIconButtonProps>(
  ({ icon, label, variant = 'default', disabled, onClick, className, ...props }, ref) => {
    return (
      <UnstyledButton
        ref={ref}
        {...props}
        aria-label={undefined}
        aria-labelledby={undefined}
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
