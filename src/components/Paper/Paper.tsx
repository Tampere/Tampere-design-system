import { forwardRef, type PropsWithChildren } from 'react';
import cx from 'clsx';
import { Paper as MantinePaper, type PaperProps as MantinePaperProps } from '@mantine/core';
import {
  root,
  backgroundVariants,
  paddingVariants,
  pill,
  withBorder,
  withShadow,
} from './Paper.css';

export type PaperProps = PropsWithChildren<
  Omit<MantinePaperProps, 'shadow' | 'radius' | 'withBorder' | 'bg' | 'p'>
> & {
  background?: 'default' | 'inverted';
  /** Corner shape. `'pill'` matches the same `cornerRadius` tier Button's `radius` prop uses (#73). */
  radius?: 'sharp' | 'pill';
  withBorder?: boolean;
  /** Default `true` — matches Figma's Card surface, which has a drop shadow (not a border). */
  withShadow?: boolean;
  padding?: 'small' | 'medium' | 'large';
  /** Polymorphic root element, e.g. `component="section"`. */
  component?: React.ElementType;
  'data-testid'?: string;
};

/** A bare surface container — background, corner radius, optional border, optional shadow, and padding. No behaviour of its own. */
export const Paper = forwardRef<HTMLDivElement, PaperProps>(
  (
    {
      background = 'default',
      radius = 'sharp',
      withBorder: hasBorder = false,
      withShadow: hasShadow = true,
      padding = 'medium',
      children,
      ...props
    },
    ref
  ) => {
    return (
      // Mantine's `Paper` is polymorphic via a large per-element prop union that a
      // manually-typed `forwardRef` wrapper can't satisfy generically — our own
      // `component?: React.ElementType` is intentionally looser. Cast at this one
      // boundary rather than losing type safety on the rest of `PaperProps`.
      <MantinePaper
        ref={ref}
        {...(props as MantinePaperProps)}
        className={cx(
          root,
          backgroundVariants[background],
          paddingVariants[padding],
          radius === 'pill' && pill,
          hasBorder && withBorder,
          hasShadow && withShadow,
          props.className
        )}
      >
        {children}
      </MantinePaper>
    );
  }
);

Paper.displayName = 'Paper';
