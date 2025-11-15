import { Flex, Accordion as MantineAccordion } from '@mantine/core';
import cx from 'clsx';
import { createContext, isValidElement, use, useState, type PropsWithChildren } from 'react';
import { ChevronDownIcon } from '../../icons/ChevronDownIcon';
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
}

export function Accordion({
  spacing,
  children,
  onChange,
  transitionDuration = 0,
  classNames,
}: AccordionProps) {
  const [value, setValue] = useState<string[]>([]);

  return (
    <MantineAccordion
      transitionDuration={transitionDuration}
      unstyled
      multiple
      value={value}
      onChange={(value) => {
        setValue(value);
        onChange?.(value);
      }}
      classNames={{
        root: cx(accordion[spacing], classNames?.root),
        control: cx(control, classNames?.control),
        label: cx(label, classNames?.label),
        item: cx(item, classNames?.item),
        chevron: cx(chevron, classNames?.chevron),
        content: cx(content, classNames?.content),
      }}
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
}

export function AccordionItem({
  label,
  children,
  value,
  disabled = false,
  openLabel,
  closeLabel,
}: AccordionItemProps) {
  return (
    <MantineAccordion.Item value={value}>
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
