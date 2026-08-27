import { Combobox, Flex, Highlight, useCombobox } from '@mantine/core';
import { type ReactElement, useMemo, useState } from 'react';
import { SearchIcon } from '../../icons/SearchIcon.tsx';
import { themeVariables } from '../../theme/themeVariables';
import { Button, ButtonProps } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { TextField, TextFieldProps } from '../TextField/';
import { dropdown, inputWrapper, listOptions, option, triggerIcon } from './SearchField.css.ts';

type SearchButtonProps = Omit<ButtonProps, 'iconOnly' | 'aria-label' | 'aria-labelledby'>;

// Search button component. Always icon-only with a required accessible name — all
// three are excluded from `SearchButtonProps` (not just hardcoded) so a caller's
// `searchButtonProps` can't smuggle any back in, and are spread onto `Button`
// after `...restProps` so they win even if one does. `aria-labelledby` must be
// excluded too, not just `aria-label`: it outranks `aria-label` when computing an
// element's accessible name, so leaving it in `ButtonProps`' `AriaAttributes`
// would let a caller override the guaranteed label through the back door.
const SearchButton = ({
  disabled,
  'aria-label': ariaLabel,
  ...restProps
}: SearchButtonProps & { 'aria-label': string }) => {
  return (
    <Button variant="primary" disabled={disabled} {...restProps} iconOnly aria-label={ariaLabel}>
      <SearchIcon className={triggerIcon} {...(!disabled && { fill: 'white' })} />
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
  /** aria-label for the search trigger button */
  searchButtonLabel: string;
  /** Trigger onSearch immediately when an item is selected */
  searchOnItemSelect?: boolean;
  isLoading?: boolean;
  searchButtonProps?: SearchButtonProps;
}

export function SearchField<T extends SearchFieldData>({
  onChange,
  data,
  onSearch,
  onClearClick,
  placeholder,
  fillAvailableSpace,
  clearButtonLabel,
  searchButtonLabel,
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
          aria-label={item.label}
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
                  fontWeight: themeVariables.theme.components.item.highlightFontWeight,
                  backgroundColor: themeVariables.theme.highlight.backgroundColor,
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
                // Defaults, overridable via searchButtonProps.
                disabled={props.disabled ?? false}
                onClick={() => {
                  const dataItem = data.find((d) => d.label === searchValue);
                  if (dataItem) onSearch(dataItem);
                }}
                {...searchButtonProps}
                // Applied after the spread, unlike the defaults above, so they always win —
                // SearchButtonProps excludes aria-label/aria-labelledby from the type, but a
                // caller could still smuggle either through a non-literal object; this closes
                // that at runtime. aria-labelledby is cleared rather than just left alone,
                // since it would otherwise outrank aria-label for the accessible name.
                aria-label={searchButtonLabel}
                aria-labelledby={undefined}
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
