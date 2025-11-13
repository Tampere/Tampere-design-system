import { Box } from '@mantine/core';
import cx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';
import { typography } from './Typography.css.ts';
import { vars } from '../../theme';

type Variant = Exclude<keyof typeof vars.components.typography, 'margin'>;
type Component = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

interface Props extends ComponentPropsWithoutRef<'div'> {
  variant: Variant;
  component?: Component;
}

const variantMap: Record<Variant, Partial<Component>> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  subheader: 'p',
  p1: 'p',
  p2: 'p',
};

export function Typography({ variant, component, children, className, ...props }: Props) {
  return (
    <Box
      {...props}
      className={className ? cx(typography[variant], className) : typography[variant]}
      component={component ?? variantMap[variant]}
    >
      {children}
    </Box>
  );
}
