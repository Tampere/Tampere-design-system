import { useEffect, useId } from 'react';
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
  pill,
  root,
  withBorder as withBorderStyle,
} from './Fieldset.css';

export interface FieldsetProps
  extends Omit<MantineFieldsetProps, 'legend' | 'variant' | 'radius'>, React.AriaAttributes {
  legend: React.ReactNode;
  /** Renders a decorative `*` next to the legend. Individual inputs inside still need their own `required` attribute — this isn't a native `<fieldset>` concept. */
  required?: boolean;
  helperText?: React.ReactNode;
  /** Presence of an error replaces `helperText`, same convention as TextField. */
  error?: string;
  /** Mantine's bordered "default" variant vs TREDS's borderless default (per Figma, #70). Default `false`. */
  withBorder?: boolean;
  /** Corner shape when `withBorder`. Same values as Paper's `radius`. Default `'sharp'`. */
  radius?: 'sharp' | 'pill';
  children?: React.ReactNode;
  'data-testid'?: string;
}

/** Groups related form inputs under a common legend, using native `<fieldset>`/`<legend>` semantics. */
export const Fieldset = ({
  legend,
  required,
  helperText,
  error,
  withBorder: hasBorder = false,
  radius = 'sharp',
  children,
  className,
  classNames,
  ...props
}: FieldsetProps) => {
  const descriptionId = useId();
  const description = error ?? helperText;

  // Dev-only guard: an out-of-union `radius` value silently falls back to the
  // sharp-corner default with no other signal — same risk class Paper already
  // guards for its own `radius` prop.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    if (radius !== 'sharp' && radius !== 'pill') {
      console.error(`Fieldset: invalid \`radius\` value "${String(radius)}".`);
    }
  }, [radius]);

  return (
    <MantineFieldset
      {...props}
      variant="unstyled"
      legend={
        <>
          {legend}
          {required && (
            <span aria-hidden="true" className={asterisk}>
              *
            </span>
          )}
        </>
      }
      className={cx(
        root,
        hasBorder && withBorderStyle,
        hasBorder && radius === 'pill' && pill,
        className
      )}
      classNames={mergeClassNames({ root: '', legend: legendStyle }, classNames)}
      aria-describedby={description ? descriptionId : props['aria-describedby']}
    >
      {description && (
        <p id={descriptionId} className={error ? errorText : helperTextStyle}>
          {description}
        </p>
      )}
      {children && <div className={childrenWrapper}>{children}</div>}
    </MantineFieldset>
  );
};
