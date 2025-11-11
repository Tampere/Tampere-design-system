import { Table as MantineTable, TableCaption } from "@mantine/core";
import type { ComponentPropsWithoutRef } from "react";
import {
  caption,
  footer,
  headerCell,
  root,
  tableCell,
  tableRow,
} from "./Table.css.ts";
import cx from "clsx";

export function Table({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"table">) {
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
}: ComponentPropsWithoutRef<"thead"> & { title?: string }) {
  return (
    <>
      {title && <TableCaption className={caption}>{title}</TableCaption>}
      <MantineTable.Thead {...props} className={cx([className])}>
        {children}
      </MantineTable.Thead>
    </>
  );
}

export function TableBody({
  children,
  ...props
}: ComponentPropsWithoutRef<"tbody">) {
  return <MantineTable.Tbody {...props}>{children}</MantineTable.Tbody>;
}

export function TableHeaderCell({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"th">) {
  return (
    <MantineTable.Th
      {...props}
      className={cx([
        headerCell[props.scope === "row" ? "row" : "col"],
        className,
      ])}
    >
      {children}
    </MantineTable.Th>
  );
}

export function TableCell({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"td">) {
  return (
    <MantineTable.Td {...props} className={cx([tableCell, className])}>
      {children}
    </MantineTable.Td>
  );
}

export function TableRow({
  children,
  className,
  onClick,
  ...props
}: ComponentPropsWithoutRef<"tr">) {
  return (
    <MantineTable.Tr
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.currentTarget.classList.contains("selected")) {
          e.currentTarget.classList.remove("selected");
        } else {
          e.currentTarget.classList.add("selected");
        }
      }}
      className={cx([tableRow, className])}
    >
      {children}
    </MantineTable.Tr>
  );
}
type TableFooterProps =
  | (ComponentPropsWithoutRef<"tfoot"> & { variant?: "tfoot" })
  | (ComponentPropsWithoutRef<"div"> & { variant: "div" });

export function TableFooter({
  children,
  className,
  variant = "tfoot",
  ...props
}: TableFooterProps) {
  const Component = variant === "div" ? "div" : MantineTable.Tfoot;
  return (
    <Component {...props} className={cx([footer, className])}>
      {children}
    </Component>
  );
}
