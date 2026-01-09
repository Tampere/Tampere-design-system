import { Flex, Accordion as MantineAccordion } from '@mantine/core';
import { createContext, isValidElement, use, useState, type PropsWithChildren } from 'react';
import { ChevronDownIcon } from '../../icons/ChevronDownIcon';
import { mergeClassNames } from '../../utils';
import { accordion, chevron, content, control, item, label } from './Accordion.css.ts';

interface AccordionControlProps {
  value: string;
  label: React.ReactNode;
  openLabel?: React.ReactNode;
  closeLabel?: React.ReactNode;
}

function AccordionControl({ value, label, openLabel, closeLabel }: AccordionControlProps) {
  const openedAccordionValues = use(AccordionContext);

  const isOpen = openedAccordionValues.includes(value);
  return (
    <Flex justify={'space-between'} flex={1} style={{ width: '100%' }}>
      {isValidElement(label) ? label : <span>{label}</span>}
      {isOpen &&
        closeLabel &&
        (isValidElement(closeLabel) ? closeLabel : <span>{closeLabel}</span>)}
      {!isOpen && openLabel && (isValidElement(openLabel) ? openLabel : <span>{openLabel}</span>)}
    </Flex>
  );
}

const AccordionContext = createContext<string[]>([]);

type AccordionGroupSpacing = 'default' | 'none';

interface AccordionProps extends PropsWithChildren {
  spacing: AccordionGroupSpacing;
  onChange?: (values: string[]) => void;
  transitionDuration?: number;
  classNames?: {
    root?: string;
    control?: string;
    label?: string;
    item?: string;
    chevron?: string;
    content?: string;
  };
  role?: 'list' | 'region' | 'group';
}

export function Accordion({
  spacing,
  children,
  onChange,
  transitionDuration = 0,
  classNames,
  role,
}: AccordionProps) {
  const [value, setValue] = useState<string[]>([]);

  const defaultClassNames = {
    root: accordion[spacing],
    control: control,
    label: label,
    item: item,
    chevron: chevron,
    content: content,
  };

  return (
    <MantineAccordion
      role={role}
      transitionDuration={transitionDuration}
      unstyled
      multiple
      value={value}
      onChange={(value) => {
        setValue(value);
        onChange?.(value);
      }}
      classNames={mergeClassNames(defaultClassNames, classNames)}
      chevron={<ChevronDownIcon />}
    >
      <AccordionContext value={value}>{children}</AccordionContext>
    </MantineAccordion>
  );
}

interface AccordionItemProps extends PropsWithChildren {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
  openLabel?: React.ReactNode;
  closeLabel?: React.ReactNode;
  role?: 'listitem';
}

export function AccordionItem({
  label,
  children,
  value,
  disabled = false,
  openLabel,
  closeLabel,
  role,
}: AccordionItemProps) {
  return (
    <MantineAccordion.Item role={role} value={value}>
      <MantineAccordion.Control disabled={disabled}>
        <AccordionControl
          value={value}
          openLabel={openLabel}
          closeLabel={closeLabel}
          label={label}
        />
      </MantineAccordion.Control>
      <MantineAccordion.Panel>{children}</MantineAccordion.Panel>
    </MantineAccordion.Item>
  );
}
