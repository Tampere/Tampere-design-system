import type { ComponentPropsWithoutRef } from 'react';
import cx from 'clsx';
import { Table as MantineTable, TableCaption } from '@mantine/core';
import { caption, footer, headerCell, root, tableCell, tableRow } from './Table.css.ts';

export function Table({ children, className, ...props }: ComponentPropsWithoutRef<'table'>) {
  return (
    <MantineTable {...props} className={cx([className, root])} unstyled>
      {children}
    </MantineTable>
  );
}

export function TableHeader({
  children,
  className,
  title,
  ...props
}: ComponentPropsWithoutRef<'thead'> & { title?: string }) {
  return (
    <>
      {title && <TableCaption className={caption}>{title}</TableCaption>}
      <MantineTable.Thead {...props} className={cx([className])}>
        {children}
      </MantineTable.Thead>
    </>
  );
}

export function TableBody({ children, ...props }: ComponentPropsWithoutRef<'tbody'>) {
  return <MantineTable.Tbody {...props}>{children}</MantineTable.Tbody>;
}

export function TableHeaderCell({ children, className, ...props }: ComponentPropsWithoutRef<'th'>) {
  return (
    <MantineTable.Th
      {...props}
      className={cx([headerCell[props.scope === 'row' ? 'row' : 'col'], className])}
    >
      {children}
    </MantineTable.Th>
  );
}

export function TableCell({ children, className, ...props }: ComponentPropsWithoutRef<'td'>) {
  return (
    <MantineTable.Td {...props} className={cx([tableCell, className])}>
      {children}
    </MantineTable.Td>
  );
}

type TableRowSelection =
  | {
      /** Whether this row is currently selected. Controlled — the consumer owns this state. */
      selected: boolean;
      /** Called with the new selection state when the row is clicked. */
      onSelectedChange: (selected: boolean) => void;
    }
  // `never` (not `{}` or `Partial<...>`) is required here — either of those
  // would silently allow `selected` alone, reopening the "selected but never
  // togglable" bug this union exists to prevent (#48).
  | { selected?: never; onSelectedChange?: never };

export type TableRowProps = ComponentPropsWithoutRef<'tr'> & TableRowSelection;

export function TableRow({
  children,
  className,
  onClick,
  selected,
  onSelectedChange,
  'aria-selected': ariaSelected,
  ...props
}: TableRowProps) {
  return (
    <MantineTable.Tr
      {...props}
      aria-selected={selected ?? ariaSelected}
      onClick={(e) => {
        onClick?.(e);
        onSelectedChange?.(!selected);
      }}
      className={cx([tableRow, selected && 'selected', className])}
    >
      {children}
    </MantineTable.Tr>
  );
}
type TableFooterProps =
  | (ComponentPropsWithoutRef<'tfoot'> & { variant?: 'tfoot' })
  | (ComponentPropsWithoutRef<'div'> & { variant: 'div' });

export function TableFooter({
  children,
  className,
  variant = 'tfoot',
  ...props
}: TableFooterProps) {
  const Component = variant === 'div' ? 'div' : MantineTable.Tfoot;
  return (
    <Component {...props} className={cx([footer, className])}>
      {children}
    </Component>
  );
}
