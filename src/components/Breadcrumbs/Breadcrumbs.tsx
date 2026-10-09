import { Anchor, Flex } from '@mantine/core';
import cx from 'clsx';
import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '../../icons/ArrowLeftIcon.tsx';
import {
  arrowLeftIcon,
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
  /** Needs to have className and children placed from props in order to function correctly. */
  linkComponent?: (props: any) => ReactNode;
}

export interface Props {
  /** Maximum number of five breadcrumb elements are displayed. */
  items: Breadcrumb[];
  ariaLabel?: string;
  className?: string;
  isMobile?: boolean;
}

export function Breadcrumbs({ items, ariaLabel, className, isMobile }: Props) {
  const displayedItems = items.slice(-5);
  const navigationLabel = ariaLabel || 'Murupolku';

  if (isMobile) {
    const prevLevelItem =
      displayedItems.length > 2 ? displayedItems[displayedItems.length - 2] : displayedItems[0];

    if (!prevLevelItem) {
      return null;
    }

    return (
      <nav aria-label={navigationLabel} className={cx(breadcrumbs, className)}>
        <Flex className={mobileWrapper}>
          <ArrowLeftIcon className={arrowLeftIcon} aria-hidden="true" />
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
    <nav aria-label={navigationLabel} className={cx(breadcrumbs, className)}>
      <ol className={breadcrumbsList}>
        {displayedItems.map((item, idx) => {
          const isCurrentPage = idx === displayedItems.length - 1;

          return (
            <li key={item.label}>
              {isCurrentPage ? (
                <span className={breadcrumbListItem} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <Anchor
                    className={breadcrumbListItem}
                    {...(item.href && { href: item.href })}
                    {...(item.linkComponent && {
                      renderRoot: (props) => item.linkComponent?.(props),
                    })}
                  >
                    {item.label}
                  </Anchor>

                  <span aria-hidden="true" className={separator}>
                    ›
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
