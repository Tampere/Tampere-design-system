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
  helperText?: string;
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
  error,
  disabled,
  onChange,
  classNames,
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

  const [textValue, setTextValue] = useState('');

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
      label={inputLabel}
      description={helperText}
      error={error}
    />
  );
};
