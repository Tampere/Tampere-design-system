import { useState } from 'react';
import cx from 'clsx';
import { TextInput, type TextInputProps } from '@mantine/core';
import { MagnifierIcon } from '../../icons/MagnifierIcon.tsx';
import { CrossIcon } from '../../icons/CrossIcon.tsx';
import { IconButton } from '../IconButton/IconButton.tsx';
import {
  description,
  errorRoot,
  errorText,
  input,
  inputPaddingVariant,
  label,
  root,
  section,
  wrapper,
  inputContainer,
} from './TextField.css.ts';

export interface TextFieldProps extends TextInputProps {
  /**
   * Label for the input field. If not set, you must provide an aria-label for accessibility.
   */
  inputLabel?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  showSearchIcon?: boolean;
  showClearButton?: boolean;
  clearButtonLabel?: string;
  endInstance?: React.ReactNode;
  onClearButtonClick?: () => void;
}

type InputStatus = 'default' | 'error' | 'disabled';

const getInputStatus = (error?: string, disabled?: boolean): InputStatus => {
  if (error) return 'error';
  if (disabled) return 'disabled';
  return 'default';
};

type SectionStatus = 'left' | 'right' | 'both';

/** Determine which sections are present */
const getSectionStatus = (
  showSearchIcon?: boolean,
  showClearButton?: boolean
): SectionStatus | null => {
  if (showSearchIcon && showClearButton) return 'both';
  if (showSearchIcon) return 'left';
  if (showClearButton) return 'right';
  return null;
};

/** Container for input and endInstance */
const InputContainer = ({
  children,
  endInstance,
}: {
  children: React.ReactNode;
  endInstance: React.ReactNode;
}) => {
  // If endInstance is provided, wrap children and endInstance in a flex container
  return endInstance ? (
    <div className={inputContainer}>
      {children}
      {endInstance && endInstance}
    </div>
  ) : (
    <>{children}</>
  );
};

/** A text field component with optional search and clear icons. */
export const TextField = ({
  inputLabel,
  helperText,
  placeholder,
  required,
  error,
  disabled,
  showSearchIcon,
  showClearButton,
  clearButtonLabel,
  endInstance,
  onChange,
  onClearButtonClick,
  ...props
}: TextFieldProps) => {
  const inputStatus = getInputStatus(error, disabled);
  const sectionStatus = getSectionStatus(showSearchIcon, showClearButton);

  const [textValue, setTextValue] = useState('');

  return (
    <TextInput
      {...props}
      onChange={(e) => {
        onChange?.(e);
        setTextValue(e.currentTarget.value);
      }}
      value={props.value ?? textValue}
      unstyled
      classNames={{
        section: section,
        root: root,
        wrapper: wrapper,
        input: cx(
          input[inputStatus],
          sectionStatus && inputPaddingVariant[sectionStatus],
          typeof props.classNames === 'object' ? props.classNames.input : undefined
        ),
        label: label[inputStatus],
        description: description[inputStatus],
        error: cx(errorRoot, errorText),
      }}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      label={inputLabel}
      description={helperText}
      error={error}
      inputContainer={(children) => (
        <InputContainer endInstance={endInstance}>{children}</InputContainer>
      )}
      {...(showSearchIcon && { leftSection: <MagnifierIcon /> })}
      {...(showClearButton &&
        textValue.length > 0 && {
          rightSection: (
            <IconButton
              aria-label={clearButtonLabel}
              onClick={() => {
                setTextValue('');
                onClearButtonClick?.();
              }}
              size={'sm'}
              variant="dark"
            >
              <CrossIcon />
            </IconButton>
          ),
        })}
    />
  );
};
