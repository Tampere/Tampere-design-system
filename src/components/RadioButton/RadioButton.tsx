import { InputHTMLAttributes, useId } from 'react';

import { RadioCheckedIcon, RadioUncheckedIcon } from '../../icons';
import * as styles from './RadioButton.css';

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
}

// React pairs `checked` with `onChange`, not `onClick`; without one it warns (#139).
const noop = () => {};

export const RadioButton = ({
  label,
  className,
  error,
  id,
  onChange,
  ...props
}: RadioButtonProps) => {
  const generatedId = useId();
  const inputId = id ?? `radio-${generatedId}`;

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      <div className={styles.iconWrapper}>
        <input
          type="radio"
          id={inputId}
          className={styles.input}
          aria-invalid={error && !props.disabled ? true : undefined}
          {...props}
          onChange={onChange ?? noop}
          data-error={error ? true : undefined}
        />
        <RadioCheckedIcon aria-hidden className={styles.iconChecked} />
        <RadioUncheckedIcon aria-hidden className={styles.iconUnchecked} />
      </div>

      {label && (
        <label data-error={error} htmlFor={inputId} className={styles.labelText}>
          {label}
        </label>
      )}
    </div>
  );
};
