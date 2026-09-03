import { Combobox, useCombobox } from '@mantine/core';
import { useState } from 'react';
import { ChevronDownIcon } from '../../icons/ChevronDownIcon.tsx';
import { CloseIcon } from '../../icons/CloseIcon.tsx';

import { IconButton } from '../IconButton';
import { TextField } from '../TextField';
import { chevronOpen, dropDown, dropDownOption, emptyMessage, listOptions } from './Select.css.ts';

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
  /**
   * Message shown in the dropdown when no options match the search. If not set, nothing is shown.
   */
  noResultsMessage?: string;
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
  noResultsMessage,
  classNames,
  ...props
}: Props) {
  const [search, setSearch] = useState('');
  const [value, setValue] = useState('');
  const combobox = useCombobox({
    // Reset the search filter whenever the dropdown opens (via click, chevron,
    // or keyboard), so a previous selection doesn't keep the list filtered
    // down next time it's opened — only actively typing should filter.
    onDropdownOpen: () => setSearch(''),
  });
  const { dropdownOpened, toggleDropdown, closeDropdown, openDropdown } = combobox;

  const filteredOptions = options.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase().trim())
  );

  const selectOptions = filteredOptions.map((item, idx) => (
    <Combobox.Option
      aria-description={`${idx + 1} / ${filteredOptions.length}`}
      component={'div'}
      className={dropDownOption}
      value={item}
      key={item}
      selected={item === value}
    >
      {item}
    </Combobox.Option>
  ));

  // Array so TextField can count the icons itself and size its reserved
  // padding accordingly — see TextField's `getRightSectionSize`.
  const rightSectionIcons = [
    !!value && (
      <IconButton
        key="clear"
        aria-label={clearButtonLabel}
        variant="default"
        disabled={disabled}
        onClick={() => {
          props.onChange?.('');
          setValue('');
          closeDropdown();
        }}
        size={'sm'}
      >
        <CloseIcon />
      </IconButton>
    ),
    <IconButton
      key="chevron"
      aria-label={dropdownOpened ? collapseButtonLabel : expandButtonLabel}
      variant="default"
      disabled={disabled}
      onMouseDown={(e) => e.nativeEvent.stopPropagation()}
      onClick={() => toggleDropdown()}
      size={'sm'}
    >
      <ChevronDownIcon className={dropdownOpened ? chevronOpen : undefined} />
    </IconButton>,
  ].filter(Boolean);

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
          disabled={disabled}
          value={props.value ?? value}
          classNames={classNames}
          helperText={helperText}
          inputLabel={inputLabel}
          placeholder={placeholder}
          clearButtonLabel={clearButtonLabel}
          error={error}
          onChange={(e) => {
            props.onChange?.(e.currentTarget.value);
            setValue(e.currentTarget.value);
            openDropdown();
            // Set after openDropdown: opening can reset search to '' via
            // onDropdownOpen, and the typed value should win over that.
            setSearch(e.currentTarget.value);
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => {
            toggleDropdown();
          }}
          showSearchIcon={showSearchIcon}
          rightSection={rightSectionIcons}
        />
      </Combobox.Target>
      <Combobox.Dropdown className={dropDown}>
        <Combobox.Options component={'div'} className={listOptions}>
          {selectOptions.length > 0
            ? selectOptions
            : noResultsMessage && (
                <Combobox.Empty className={emptyMessage}>{noResultsMessage}</Combobox.Empty>
              )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
