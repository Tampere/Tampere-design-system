import { TextInput, type TextInputProps } from '@mantine/core';
import cx from 'clsx';
import { Children, forwardRef, useEffect, useState } from 'react';
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
  /** @deprecated Use `inputLabel` instead. `label` will be removed in 2.0. */
  label?: TextInputProps['label'];
  helperText?: React.ReactNode;
  /** @deprecated Use `helperText` instead. `description` will be removed in 2.0. */
  description?: TextInputProps['description'];
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
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      inputLabel,
      helperText,
      // Mantine's names still work as fallbacks so 1.x stays non-breaking; drop them in 2.0.
      label: mantineLabel,
      description: mantineDescription,
      error,
      disabled,
      showSearchIcon,
      showClearButton,
      clearButtonLabel,
      endInstance,
      onChange,
      onClearButtonClick,
      classNames,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const inputStatus = getInputStatus(error, disabled);

    // String(): the DOM stores numeric values as text, so `.length` must see them that way too (#200).
    const [textValue, setTextValue] = useState(String(defaultValue ?? ''));
    const currentValue = String(props.value ?? textValue);

    // TextField padding is calculated based on which icons are shown in
    // right and left sections
    const hasClearButton = !!showClearButton && currentValue.length > 0;
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
        ref={ref}
        onChange={(e) => {
          onChange?.(e);
          setTextValue(e.currentTarget.value);
        }}
        value={currentValue}
        unstyled
        classNames={mergeClassNames(defaultClassNames, classNames)}
        disabled={disabled}
        // Joined with `||`, not `??`: an empty inputLabel would otherwise leave the input unnamed.
        label={inputLabel || mantineLabel}
        description={helperText || mantineDescription}
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
  }
);

TextField.displayName = 'TextField';
