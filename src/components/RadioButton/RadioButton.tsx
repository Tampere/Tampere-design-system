import { InputHTMLAttributes, useId } from 'react';

import { RadioCheckedIcon, RadioUncheckedIcon } from '../../icons';
import * as styles from './RadioButton.css';

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
}

export const RadioButton = ({
  label,
  checked,
  className,
  error,
  id,
  ...props
}: RadioButtonProps) => {
  const generatedId = useId();
  const inputId = id ?? `radio-${generatedId}`;

  const getInputVariant = () => {
    if (error) return { 'data-error': true };
    if (props.disabled) return { 'data-disabled': true };
    if (checked) return { 'data-checked': true };
    return null;
  };
  const inputVariant = getInputVariant();

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      <div className={styles.iconWrapper}>
        <input
          type="radio"
          id={inputId}
          checked={checked}
          className={styles.input}
          {...props}
          {...inputVariant}
        />
        {checked ? (
          <RadioCheckedIcon aria-hidden className={styles.icon} />
        ) : (
          <RadioUncheckedIcon aria-hidden className={styles.icon} />
        )}
      </div>

      {label && (
        <label
          data-disabled={props.disabled}
          data-error={error}
          htmlFor={inputId}
          className={styles.labelText}
        >
          {label}
        </label>
      )}
    </div>
  );
};
