import { useId } from 'react';
import cx from 'clsx';
import {
  Fieldset as MantineFieldset,
  type FieldsetProps as MantineFieldsetProps,
} from '@mantine/core';
import { mergeClassNames } from '../../utils.ts';
import {
  asterisk,
  childrenWrapper,
  errorText,
  helperText as helperTextStyle,
  legend as legendStyle,
  root,
  withBorder as withBorderStyle,
} from './Fieldset.css';

export interface FieldsetProps
  extends Omit<MantineFieldsetProps, 'legend' | 'variant' | 'radius'>, React.AriaAttributes {
  legend: React.ReactNode;
  /** Renders a decorative `*` next to the legend. Individual inputs inside still need their own `required` attribute — this isn't a native `<fieldset>` concept. */
  showRequiredMarker?: boolean;
  helperText?: React.ReactNode;
  /** Rendered alongside `helperText`, not replacing it — matches TextField/Mantine's InputWrapper, which shows description and error together. */
  error?: string;
  /** Mantine's bordered "default" variant vs TREDS's borderless default (per Figma, #70). Default `false`. Sharp corners only — a rounded/pill radius needs more design work before it's offered here. */
  withBorder?: boolean;
  children?: React.ReactNode;
  'data-testid'?: string;
}

/** Groups related form inputs under a common legend, using native `<fieldset>`/`<legend>` semantics. */
export const Fieldset = ({
  legend,
  showRequiredMarker,
  helperText,
  error,
  withBorder: hasBorder = false,
  children,
  className,
  classNames,
  ...props
}: FieldsetProps) => {
  const helperTextId = useId();
  const errorId = useId();
  const describedBy =
    [helperText && helperTextId, error && errorId, props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <MantineFieldset
      {...props}
      variant="unstyled"
      legend={
        <>
          {legend}
          {showRequiredMarker && (
            <span aria-hidden="true" className={asterisk}>
              *
            </span>
          )}
        </>
      }
      className={cx(root, hasBorder && withBorderStyle, className)}
      classNames={mergeClassNames({ root: '', legend: legendStyle }, classNames)}
      aria-describedby={describedBy}
    >
      {helperText && (
        <p id={helperTextId} className={helperTextStyle}>
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className={errorText}>
          {error}
        </p>
      )}
      {children && <div className={childrenWrapper}>{children}</div>}
    </MantineFieldset>
  );
};
