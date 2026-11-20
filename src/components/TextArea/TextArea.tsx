import { Textarea, TextareaProps } from '@mantine/core';
import cx from 'clsx';
import { useState } from 'react';
import { mergeClassNames } from '../../utils.ts';
import { description, errorRoot, errorText, input, label, root, wrapper } from './TextArea.css.ts';

export interface TextAreaProps extends TextareaProps, React.AriaAttributes {
  /**
   * Label for the textarea field. If not set, you must provide an aria-label for accessibility.
   */
  inputLabel?: string;
  /** @deprecated Use `inputLabel` instead. `label` will be removed in 2.0. */
  label?: TextareaProps['label'];
  helperText?: string;
  /** @deprecated Use `helperText` instead. `description` will be removed in 2.0. */
  description?: TextareaProps['description'];
  error?: string; // Overrides TextInputProps error to be string for error message. Remove this if custom error components are needed.
}

type InputStatus = 'default' | 'error' | 'disabled';

const getInputStatus = (error?: TextAreaProps['error'], disabled?: boolean): InputStatus => {
  if (error) return 'error';
  if (disabled) return 'disabled';
  return 'default';
};

/** A text area component with resizable area. */
export const TextArea = ({
  inputLabel,
  helperText,
  // Mantine's names still work as fallbacks so 1.x stays non-breaking; drop them in 2.0 (#178).
  label: mantineLabel,
  description: mantineDescription,
  error,
  disabled,
  onChange,
  classNames,
  defaultValue,
  ...props
}: TextAreaProps) => {
  const inputStatus = getInputStatus(error, disabled);

  const defaultClassNames = {
    root: root,
    wrapper: wrapper,
    input: input[inputStatus],
    label: label[inputStatus],
    description: description[inputStatus],
    error: cx(errorRoot, errorText),
  };

  const [textValue, setTextValue] = useState(String(defaultValue ?? ''));

  return (
    <Textarea
      {...props}
      onChange={(e) => {
        onChange?.(e);
        setTextValue(e.currentTarget.value);
      }}
      value={props.value ?? textValue}
      unstyled
      classNames={mergeClassNames(defaultClassNames, classNames)}
      disabled={disabled}
      // Joined with `||`, not `??`: an empty inputLabel would otherwise leave the textarea unnamed.
      label={inputLabel || mantineLabel}
      description={helperText || mantineDescription}
      error={error}
    />
  );
};
