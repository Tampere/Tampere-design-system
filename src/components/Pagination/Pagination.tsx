import { Flex, List, UnstyledButton } from '@mantine/core';
import { IconButton } from '../IconButton/IconButton.tsx';
import { IconChevronLeft } from '../../icons/IconChevronLeft';
import { leftButton, list, listItem, rightButton } from './Pagination.css.ts';

interface Props {
  pageCount: number;
  activePageIndex: number;
  onPageChange: (newPageIndex: number) => void;
  /** Function to assign an aria-label to each page button item */
  getAriaLabelForButton?: (pageIndex: number) => string;
  maxVisiblePages?: number;
  leftButtonLabel?: string;
  rightButtonLabel?: string;
}

interface ListItemProps extends Props {
  index: number;
}

function ListItem({ index, ...props }: ListItemProps) {
  return (
    <List.Item key={index}>
      <UnstyledButton
        {...(props.getAriaLabelForButton && {
          ['aria-label']: props.getAriaLabelForButton(index),
        })}
        {...(index === props.activePageIndex && { 'aria-current': 'page' })}
        onClick={() => {
          props.onPageChange(index);
        }}
        className={listItem[index === props.activePageIndex ? 'active' : 'default']}
      >
        {index + 1}
      </UnstyledButton>
    </List.Item>
  );
}

function EllipsisItem() {
  return (
    <List.Item>
      <span className={listItem.root}>...</span>
    </List.Item>
  );
}

export function Pagination({
  pageCount,
  activePageIndex,
  onPageChange,
  getAriaLabelForButton,
  maxVisiblePages = 5,
  leftButtonLabel,
  rightButtonLabel,
}: Props) {
  const visibleMiddlePages = maxVisiblePages - 2; // First and last pages are always shown
  const visibleLeftOfActive = Math.floor(visibleMiddlePages / 2);
  const visibleRightOfActive = Math.max(
    0,
    Math.min(Math.ceil(visibleMiddlePages / 2), pageCount - 1 - activePageIndex)
  );

  const startPage = Math.max(
    1,
    activePageIndex - Math.max(visibleLeftOfActive, visibleMiddlePages - visibleRightOfActive)
  );
  const endPage = Math.min(startPage + visibleMiddlePages - 1, pageCount - 1);
  const displayLeftEllipsis = startPage > 1;
  const displayRightEllipsis = endPage < pageCount - 2;

  return (
    <Flex component={'nav'}>
      <IconButton
        aria-label={leftButtonLabel}
        disabled={activePageIndex === 0}
        onClick={() => {
          onPageChange(activePageIndex - 1);
        }}
        className={leftButton}
        size="lg"
        variant="dark"
      >
        <IconChevronLeft />
      </IconButton>
      <List display="flex" className={list}>
        {Array.from({ length: pageCount }, (_, index) => {
          if (
            (index === 1 && displayLeftEllipsis) ||
            (index === pageCount - 2 && displayRightEllipsis)
          ) {
            return <EllipsisItem key={index} />;
          } else if (
            index === 0 ||
            index === pageCount - 1 ||
            (index >= (displayLeftEllipsis ? startPage + 1 : startPage) &&
              index <= (displayRightEllipsis ? endPage - 1 : endPage))
          ) {
            return (
              <ListItem
                key={index}
                index={index}
                getAriaLabelForButton={getAriaLabelForButton}
                pageCount={pageCount}
                maxVisiblePages={maxVisiblePages}
                activePageIndex={activePageIndex}
                onPageChange={(newPageIndex) => {
                  onPageChange(newPageIndex);
                }}
              />
            );
          }
        })}
      </List>
      <IconButton
        aria-label={rightButtonLabel}
        disabled={activePageIndex === pageCount - 1}
        onClick={() => {
          onPageChange(activePageIndex + 1);
        }}
        className={rightButton}
        size="lg"
        variant="dark"
      >
        <IconChevronLeft />
      </IconButton>
    </Flex>
  );
}
