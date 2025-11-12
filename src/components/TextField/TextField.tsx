import { TextInput, type TextInputProps } from '@mantine/core';
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
} from './TextField.css.ts';
import { MagnifierIcon } from 'src/icons/MagnifierIcon.tsx';
import cx from 'clsx';
import { CrossIcon } from 'src/icons/CrossIcon.tsx';
import { useState } from 'react';
import { IconButton } from '../IconButton/IconButton.tsx';

interface Props extends TextInputProps {
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
  onClearButtonClick?: () => void;
}

type InputStatus = 'default' | 'error' | 'disabled';

function getInputStatus(error?: string, disabled?: boolean): InputStatus {
  if (error) return 'error';
  if (disabled) return 'disabled';
  return 'default';
}

type SectionStatus = 'left' | 'right' | 'both';

function getSectionStatus(
  showSearchIcon?: boolean,
  showClearButton?: boolean
): SectionStatus | null {
  if (showSearchIcon && showClearButton) return 'both';
  if (showSearchIcon) return 'left';
  if (showClearButton) return 'right';
  return null;
}

export function TextField({
  inputLabel,
  helperText,
  placeholder,
  required,
  error,
  disabled,
  showSearchIcon,
  showClearButton,
  clearButtonLabel,
  onChange,
  onClearButtonClick,
  ...props
}: Props) {
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
      withAsterisk={required}
      placeholder={placeholder}
      label={inputLabel}
      description={helperText}
      error={error}
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
}
