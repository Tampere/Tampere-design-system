import { TextInput, type TextInputProps } from '@mantine/core';
import cx from 'clsx';
import { Children, useEffect, useState } from 'react';
import { CloseIcon } from '../../icons/CloseIcon.tsx';
import { SearchIcon } from '../../icons/SearchIcon.tsx';
import { mergeClassNames } from '../../utils.ts';
import { IconButton } from '../IconButton/IconButton.tsx';
import {
  description,
  errorRoot,
  errorText,
  input,
  inputContainer,
  label,
  leftSectionPadding,
  rightSectionPadding,
  root,
  section,
  wrapper,
} from './TextField.css.ts';

export interface TextFieldProps extends TextInputProps, React.AriaAttributes {
  /**
   * Label for the input field. If not set, you must provide an aria-label for accessibility.
   */
  inputLabel?: string;
  helperText?: React.ReactNode;
  error?: string; // Overrides TextInputProps error to be string for error message. Remove this if custom error components are needed.
  showSearchIcon?: boolean;
  showClearButton?: boolean;
  clearButtonLabel?: string;
  endInstance?: React.ReactNode;
  onClearButtonClick?: () => void;
}

type InputStatus = 'default' | 'error' | 'disabled';

const getInputStatus = (error?: TextFieldProps['error'], disabled?: boolean): InputStatus => {
  if (error) return 'error';
  if (disabled) return 'disabled';
  return 'default';
};

type SectionSize = 'single' | 'double';

/** How much right padding to reserve, based on how many icons the section actually holds. */
const getRightSectionSize = (iconCount: number): SectionSize =>
  iconCount >= 2 ? 'double' : 'single';

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
  error,
  disabled,
  showSearchIcon,
  showClearButton,
  clearButtonLabel,
  endInstance,
  onChange,
  onClearButtonClick,
  classNames,
  ...props
}: TextFieldProps) => {
  const inputStatus = getInputStatus(error, disabled);

  const [textValue, setTextValue] = useState('');

  // TextField padding is calculated based on which icons are shown in
  // right and left sections
  const hasClearButton = !!showClearButton && textValue.length > 0;
  const rightIconCount = hasClearButton ? 1 : Children.count(props.rightSection);
  const hasRightSection = rightIconCount > 0;
  const hasLeftSection = !!showSearchIcon || !!props.leftSection;

  // Dev-only guard: padding is only sized for up to 2 icons (see
  // `getRightSectionSize`/`rightSectionPadding`)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && rightIconCount > 2) {
      console.error(
        `TextField: \`rightSection\` has ${rightIconCount} icons, but padding is only reserved for up to 2 — text may run underneath.`
      );
    }
  }, [rightIconCount]);

  const defaultClassNames = {
    section: section,
    root: root,
    wrapper: wrapper,
    input: cx(
      input[inputStatus],
      hasLeftSection && leftSectionPadding,
      hasRightSection && rightSectionPadding[getRightSectionSize(rightIconCount)]
    ),
    label: label[inputStatus],
    description: description[inputStatus],
    error: cx(errorRoot, errorText),
  };

  return (
    <TextInput
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
      inputContainer={(children) => (
        <InputContainer endInstance={endInstance}>{children}</InputContainer>
      )}
      {...(showSearchIcon && { leftSection: <SearchIcon /> })}
      {...(hasClearButton && {
        rightSection: (
          <IconButton
            aria-label={clearButtonLabel}
            onClick={() => {
              setTextValue('');
              onClearButtonClick?.();
            }}
            size={'sm'}
            variant="default"
          >
            <CloseIcon />
          </IconButton>
        ),
      })}
    />
  );
};
