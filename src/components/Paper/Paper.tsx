import { forwardRef, type PropsWithChildren } from 'react';
import cx from 'clsx';
import { Paper as MantinePaper, type PaperProps as MantinePaperProps } from '@mantine/core';
import {
  root,
  backgroundVariants,
  paddingVariants,
  pill,
  withBorder,
  borderColorVariants,
  withShadow,
} from './Paper.css';

export type PaperProps = PropsWithChildren<
  Omit<
    MantinePaperProps,
    // The curated props below (`radius`/`withBorder`/`padding`) each replace a
    // Mantine style prop of the same effect — omit both the renamed key and
    // every same-effect alias (`bd`/`bdrs` for border, `p*` for padding), or a
    // consumer could bypass the curated API entirely via the Mantine original.
    | 'shadow'
    | 'radius'
    | 'bdrs'
    | 'withBorder'
    | 'bd'
    | 'bg'
    | 'p'
    | 'px'
    | 'py'
    | 'pt'
    | 'pb'
    | 'pl'
    | 'pr'
    | 'ps'
    | 'pe'
  >
> & {
  /**
   * `'default'` is white. The other three are Figma's own "color override" examples
   * (confirmed by pixel-sampling a real rendered instance of each, since Figma's
   * reference codegen only reports the base component's default binding, not
   * per-instance fill overrides). `'red' | 'yellow' | 'green'` aren't included yet —
   * no confirmed Figma example backs a specific shade for those.
   */
  background?: 'default' | 'turquoise' | 'blue' | 'pink';
  /** Corner shape. `'pill'` matches the same `cornerRadius` tier Button's `radius` prop uses (#73). */
  radius?: 'sharp' | 'pill';
  /** Default `false`. */
  withBorder?: boolean;
  /** Only applied when `withBorder` is set. Default `'divider'` (neutral). */
  borderColor?: 'divider' | 'brand';
  /** Default `true` — matches Figma's Card surface, which has a drop shadow (not a border). */
  withShadow?: boolean;
  /** Default `'md'`. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
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
      borderColor = 'divider',
      withShadow: hasShadow = true,
      padding = 'md',
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
          hasBorder && borderColorVariants[borderColor],
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
