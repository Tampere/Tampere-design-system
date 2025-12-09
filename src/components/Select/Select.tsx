import { useState } from 'react';
import cx from 'clsx';
import { Combobox, Flex, useCombobox } from '@mantine/core';
import { IconButton } from '../IconButton';
import { TextField } from '../TextField';
import { ChevronDownIcon } from '../../icons/ChevronDownIcon.tsx';
import { CloseIcon } from '../../icons/CloseIcon.tsx';
import {
  dropDown,
  dropDownOption,
  inputField,
  listOptions,
  rightSectionContainer,
  root,
} from './Select.css.ts';

interface Props {
  /**
   * Label for the input field. If not set, you must provide an aria-label for accessibility.
   */
  inputLabel?: string;
  helperText?: string;
  placeholder?: string;
  clearButtonLabel?: string;
  expandButtonLabel?: string;
  collapseButtonLabel?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  options: string[];
  showSearchIcon?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  classNames?: {
    root?: string;
    wrapper?: string;
    input?: string;
  };
}

interface SelectRightSectionProps {
  toggleDropdown: () => void;
  onClearClick: () => void;
  dropDownOpened: boolean;
  displayClearButton?: boolean;
  expandButtonLabel?: string;
  collapseButtonLabel?: string;
  clearButtonLabel?: string;
}

function SelectRightSection({
  toggleDropdown,
  displayClearButton,
  onClearClick,
  dropDownOpened,
  expandButtonLabel,
  collapseButtonLabel,
  clearButtonLabel,
}: SelectRightSectionProps) {
  return (
    <Flex className={rightSectionContainer}>
      {displayClearButton && (
        <IconButton aria-label={clearButtonLabel} variant="dark" onClick={onClearClick} size={'sm'}>
          <CloseIcon />
        </IconButton>
      )}
      <IconButton
        aria-label={dropDownOpened ? collapseButtonLabel : expandButtonLabel}
        variant="dark"
        onClick={() => {
          toggleDropdown();
        }}
        size={'sm'}
      >
        {dropDownOpened ? <ChevronDownIcon rotate={180} /> : <ChevronDownIcon />}
      </IconButton>
    </Flex>
  );
}

export function Select({
  inputLabel,
  helperText,
  placeholder,
  required,
  error,
  disabled,
  options,
  showSearchIcon,
  clearButtonLabel,
  expandButtonLabel,
  collapseButtonLabel,
  classNames,
  ...props
}: Props) {
  const combobox = useCombobox();
  const { dropdownOpened, toggleDropdown, closeDropdown, openDropdown } = combobox;

  const [value, setValue] = useState('');

  const filteredOptions = options.filter((item) =>
    item.toLowerCase().includes(value.toLowerCase().trim())
  );

  const selectOptions = filteredOptions.map((item, idx) => (
    <Combobox.Option
      aria-description={`${idx + 1} / ${options.length}`}
      component={'li'}
      className={dropDownOption}
      value={item}
      key={item}
      selected={item === value}
    >
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      offset={0}
      store={combobox}
      onOptionSubmit={(val) => {
        props.onChange?.(val);
        setValue(val);
        closeDropdown();
      }}
      disabled={disabled}
    >
      <Combobox.Target>
        <TextField
          unstyled
          tabIndex={0}
          required={required}
          value={props.value ?? value}
          classNames={{
            root: cx(classNames?.root),
            wrapper: cx(root, classNames?.wrapper),
            input: cx(inputField, classNames?.input),
          }}
          helperText={helperText}
          inputLabel={inputLabel}
          placeholder={placeholder}
          clearButtonLabel={clearButtonLabel}
          error={error}
          onChange={(e) => {
            props.onChange?.(e.currentTarget.value);
            setValue(e.currentTarget.value);
            openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => {
            toggleDropdown();
          }}
          showSearchIcon={showSearchIcon}
          rightSection={
            <SelectRightSection
              expandButtonLabel={expandButtonLabel}
              collapseButtonLabel={collapseButtonLabel}
              dropDownOpened={dropdownOpened}
              toggleDropdown={toggleDropdown}
              displayClearButton={!!value}
              onClearClick={() => {
                props.onChange?.('');
                setValue('');
                closeDropdown();
              }}
            />
          }
        />
      </Combobox.Target>
      <Combobox.Dropdown className={dropDown}>
        <Combobox.Options component={'ul'} className={listOptions}>
          {selectOptions}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
