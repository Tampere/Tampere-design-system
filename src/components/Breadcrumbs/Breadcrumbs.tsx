import { Anchor, Flex } from '@mantine/core';
import cx from 'clsx';
import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '../../icons/ArrowLeftIcon.tsx';
import {
  breadcrumbItem,
  breadcrumbListItem,
  breadcrumbs,
  breadcrumbsList,
  mobileWrapper,
  separator,
} from './Breadcrumbs.css.ts';

export interface Breadcrumb {
  label: string;
  href?: string;
  /** Needs to have className and children placed from props in order to function correctly.  */

  linkComponent?: (props: any) => ReactNode;
}

export interface Props {
  /** Maximum number of five breadcrumb elements are displayed.  */
  items: Breadcrumb[];
  ariaLabel?: string;
  className?: string;
  isMobile?: boolean;
}

export function Breadcrumbs({ items, ariaLabel, className, isMobile }: Props) {
  const displayedItems = items.slice(-5);

  if (isMobile) {
    const prevLevelItem =
      displayedItems.length > 2 ? items[displayedItems.length - 2] : displayedItems[0];
    return (
      <nav {...(ariaLabel && { ['aria-label']: ariaLabel })} className={cx(breadcrumbs, className)}>
        <Flex className={mobileWrapper}>
          <ArrowLeftIcon />
          <Anchor
            datatype="mobile-breadcrumb"
            className={breadcrumbItem}
            {...(prevLevelItem.href && { href: prevLevelItem.href })}
            {...(prevLevelItem.linkComponent && {
              renderRoot: (props) => prevLevelItem.linkComponent?.(props),
            })}
          >
            {prevLevelItem.label}
          </Anchor>
        </Flex>
      </nav>
    );
  }

  return (
    <nav {...(ariaLabel && { ['aria-label']: ariaLabel })} className={breadcrumbs}>
      <ol className={breadcrumbsList}>
        {displayedItems.map((item, idx) => (
          <li key={item.label}>
            <Anchor
              className={breadcrumbListItem}
              {...(item.href && { href: item.href })}
              {...(item.linkComponent && {
                renderRoot: (props) => item.linkComponent?.(props),
              })}
            >
              {item.label}
            </Anchor>

            {idx < displayedItems.length - 1 && <span className={separator}>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
