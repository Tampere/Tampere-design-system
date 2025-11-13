import { type ReactElement, useMemo, useState } from 'react';
import { Combobox, type ComboboxProps, Flex, Highlight, useCombobox } from '@mantine/core';
import { Button } from '../Button';
import { TextField } from '../TextField/';
import { MagnifierIcon } from '../../icons/MagnifierIcon';
import { themeVariables } from '../../theme/themeVariables.ts';
import { button, dropdown, inputWrapper, listOptions, option } from './SearchField.css.ts';

function SearchButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <Button
      aria-label={label}
      disabled={disabled}
      variant="filled"
      onClick={onClick}
      className={button[disabled ? 'disabled' : 'default']}
    >
      <MagnifierIcon {...(!disabled && { fill: 'white' })} />
    </Button>
  );
}

interface SearchFieldData {
  value: string;
  label: string;
  /** A custom element that will be rendered in place of label to appearing listbox */
  labelElement?: ReactElement;
}

interface Props<T extends SearchFieldData> extends ComboboxProps {
  onChange: (value: string) => void;
  data: T[];
  onSearch: (value: T) => void;
  inputLabel: string;
  onClearClick?: () => void;
  /** Aria-label attribute for search button. */
  searchButtonLabel: string;
  fillAvailableSpace?: boolean;
  clearButtonLabel: string;
  /** Trigger onSearch immediately when an item is selected */
  searchOnItemSelect?: boolean;
}

export function SearchField<T extends SearchFieldData>({
  onChange,
  data,
  onSearch,
  onClearClick,
  inputLabel,
  searchButtonLabel,
  fillAvailableSpace,
  clearButtonLabel,
  searchOnItemSelect,
  ...props
}: Props<T>) {
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [currentValue, setCurrentValue] = useState<string>('');

  const combobox = useCombobox();

  const options = useMemo(
    () =>
      data.map((item, idx) => (
        <Combobox.Option
          aria-description={`${idx + 1} / ${data.length}`}
          className={option}
          value={item.label} // Note this is on purpose. The label value is rendered to input after select.
          component="li"
          key={item.value}
          selected={item.value === currentValue}
        >
          {!item.labelElement && item.value !== currentValue ? (
            <Highlight
              highlightStyles={() => {
                return {
                  color: 'currentcolor',
                  fontWeight: themeVariables.components.item.highlightFontWeight,
                  backgroundColor: themeVariables.highlight.backgroundColor,
                };
              }}
              highlight={currentValue}
            >
              {item.label}
            </Highlight>
          ) : (
            (item.labelElement ?? item.label)
          )}
        </Combobox.Option>
      )),
    [data, currentValue]
  );

  return (
    <Combobox
      {...props}
      offset={0}
      onOptionSubmit={(optionValue) => {
        if (searchOnItemSelect) {
          const dataItem = data.find((d) => d.label === optionValue);
          if (dataItem) onSearch(dataItem);
        }
        setCurrentValue(optionValue);
        setSearchValue(optionValue);
        combobox.closeDropdown();
      }}
      store={combobox}
    >
      <Flex {...(fillAvailableSpace && { flex: 1 })}>
        <Combobox.Target>
          <TextField
            disabled={props.disabled}
            className={inputWrapper}
            label={inputLabel}
            placeholder={inputLabel}
            value={currentValue}
            onChange={(event) => {
              setCurrentValue(event.currentTarget.value);
              onChange(event.currentTarget.value);

              combobox.openDropdown();
              combobox.resetSelectedOption();
            }}
            onClick={() => {
              combobox.openDropdown();
            }}
            onBlur={() => {
              combobox.closeDropdown();
              combobox.updateSelectedOptionIndex();
            }}
            clearButtonLabel={clearButtonLabel}
            showClearButton
            onClearButtonClick={() => {
              setCurrentValue('');
              combobox.closeDropdown();
              combobox.resetSelectedOption();
              onClearClick?.();
            }}
          />
        </Combobox.Target>
        <SearchButton
          label={searchButtonLabel}
          disabled={props.disabled ?? false}
          onClick={() => {
            const dataItem = data.find((d) => d.label === searchValue);
            if (dataItem) onSearch(dataItem);
          }}
        />
      </Flex>

      <Combobox.Dropdown hidden={options.length === 0} className={dropdown}>
        <Combobox.Options component={'ul'} className={listOptions}>
          {options}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
