import { type ReactElement, useMemo, useState } from 'react';
import { Combobox, Flex, Highlight, useCombobox } from '@mantine/core';
import { Button, ButtonProps } from '../Button';
import { TextField, TextFieldProps } from '../TextField/';
import { MagnifierIcon } from '../../icons/MagnifierIcon';
import { themeVariables } from '../../theme/themeVariables.ts';
import { dropdown, inputWrapper, listOptions, option } from './SearchField.css.ts';
import { LoadingSpinner } from '../LoadingIndicators';

// Search button component
const SearchButton = ({ disabled, ...restProps }: ButtonProps) => {
  return (
    <Button variant="filled" disabled={disabled} {...restProps}>
      <MagnifierIcon {...(!disabled && { fill: 'white' })} />
    </Button>
  );
};

/**
 * Loading option component
 * @returns Combobox option with loading spinner
 */
const LoadingOption = () => {
  return (
    <Combobox.Option className={option} component="li" value="loading">
      <LoadingSpinner size={'sm'} />
    </Combobox.Option>
  );
};

/**
 * Data item for SearchField component
 */
export interface SearchFieldData {
  value: string;
  label: string;
  /** A custom element that will be rendered in place of label to appearing listbox */
  labelElement?: ReactElement;
}

/**
 * Props for SearchField component
 */
export interface SearchFieldProps<T extends SearchFieldData> extends TextFieldProps {
  data: T[];
  onSearch: (value: T) => void;
  onClearClick?: () => void;
  fillAvailableSpace?: boolean;
  clearButtonLabel: string;
  /** Trigger onSearch immediately when an item is selected */
  searchOnItemSelect?: boolean;
  isLoading?: boolean;
  searchButtonProps?: ButtonProps;
}

export function SearchField<T extends SearchFieldData>({
  onChange,
  data,
  onSearch,
  onClearClick,
  placeholder,
  fillAvailableSpace,
  clearButtonLabel,
  searchOnItemSelect,
  isLoading = false,
  searchButtonProps,
  ...props
}: SearchFieldProps<T>) {
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
            {...props}
            className={inputWrapper}
            placeholder={placeholder}
            value={currentValue}
            onChange={(event) => {
              setCurrentValue(event.currentTarget.value);
              onChange?.(event);

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
            endInstance={
              <SearchButton
                // set default bahaviout for some properties
                aria-label={props.inputLabel}
                disabled={props.disabled ?? false}
                onClick={() => {
                  const dataItem = data.find((d) => d.label === searchValue);
                  if (dataItem) onSearch(dataItem);
                }}
                // Allow overriding other props
                {...searchButtonProps}
              />
            }
          />
        </Combobox.Target>
      </Flex>

      <Combobox.Dropdown hidden={options.length === 0 && !isLoading} className={dropdown}>
        <Combobox.Options component={'ul'} className={listOptions}>
          {isLoading ? <LoadingOption /> : options}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
