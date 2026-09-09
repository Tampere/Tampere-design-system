import { Combobox, useCombobox } from '@mantine/core';
import { useState } from 'react';
import { ChevronDownIcon } from '../../icons/ChevronDownIcon.tsx';
import { CloseIcon } from '../../icons/CloseIcon.tsx';

import { IconButton } from '../IconButton';
import { TextField } from '../TextField';
import {
  chevronOpen,
  dropDown,
  dropDownGroupLabel,
  dropDownOption,
  emptyMessage,
  listOptions,
} from './Select.css.ts';
export interface SelectOptionGroup {
  // Header shown above the group's options.
  group: string;
  items: string[];
}

// SelectOptions are either list of items or list of grouped items with headers
export type SelectOptions = string[] | SelectOptionGroup[];

export interface SelectProps {
  inputLabel?: string;
  helperText?: string;
  placeholder?: string;
  clearButtonLabel?: string;
  expandButtonLabel?: string;
  collapseButtonLabel?: string;
  noResultsMessage?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  options: SelectOptions;
  showSearchIcon?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  classNames?: {
    root?: string;
    wrapper?: string;
    input?: string;
  };
}

// Checking options type based on the first option in the options array
function isGroupedOptions(options: SelectOptions): options is SelectOptionGroup[] {
  return options.length > 0 && typeof options[0] === 'object';
}

export const Select = ({
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
}: SelectProps) => {
  const [search, setSearch] = useState('');
  const [value, setValue] = useState('');
  const combobox = useCombobox({
    // Reset the search filter whenever the dropdown opens so a previous
    // selection doesn't keep the list filtered down next time it's opened
    // — only actively typing should filter.
    onDropdownOpen: () => setSearch(''),
  });
  const { dropdownOpened, toggleDropdown, closeDropdown, openDropdown } = combobox;

  // Normalize both option shapes into a single list of groups so the filtering
  // and rendering below doesn't need to branch on which shape was passed.
  const groups: { group?: string; items: string[] }[] = isGroupedOptions(options)
    ? options
    : [{ items: options }];

  const searchQuery = search.toLowerCase().trim();

  const filteredGroups = groups
    .map((group) => {
      const groupHeaderMatches = !!group.group && group.group.toLowerCase().includes(searchQuery);

      return {
        group: group.group,
        items: groupHeaderMatches
          ? group.items
          : group.items.filter((item) => item.toLowerCase().includes(searchQuery)),
      };
    })
    .filter((group) => group.items.length > 0);

  // Accessible position count across groups
  const totalVisibleOptions = filteredGroups.reduce((sum, group) => sum + group.items.length, 0);

  const groupOffsets = filteredGroups.reduce<number[]>((offsets, _, groupIdx) => {
    offsets.push(
      groupIdx === 0 ? 0 : offsets[groupIdx - 1] + filteredGroups[groupIdx - 1].items.length
    );
    return offsets;
  }, []);

  const selectOptions = filteredGroups.flatMap((group, groupIdx) => {
    const currentGroupOffset = groupOffsets[groupIdx];

    const renderedOptions = group.items.map((item, itemIdx) => (
      <Combobox.Option
        aria-description={`${currentGroupOffset + itemIdx + 1} / ${totalVisibleOptions}`}
        component={'div'}
        className={dropDownOption}
        value={item}
        key={`${groupIdx}-${item}`}
        selected={item === value}
      >
        {item}
      </Combobox.Option>
    ));

    if (!group.group) {
      return renderedOptions;
    }

    return (
      <Combobox.Group
        label={group.group}
        key={`${groupIdx}-${group.group}`}
        classNames={{ groupLabel: dropDownGroupLabel }}
      >
        {renderedOptions}
      </Combobox.Group>
    );
  });

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
};
