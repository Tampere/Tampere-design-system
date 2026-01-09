import type { PropsWithChildren } from 'react';
import { ActionIcon, type ActionIconProps, createPolymorphicComponent } from '@mantine/core';
import { mergeClassNames } from '../../utils';
import { iconWrapper, iconRoot } from './IconButton.css.ts';

type IconButtonVariant = 'light' | 'dark';
type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface Props extends ActionIconProps, PropsWithChildren {
  variant?: IconButtonVariant;
  size: IconButtonSize;
  classNames?: {
    root?: string;
    icon?: string;
  };
}

function IconButtonComponent({ variant = 'light', size, classNames, ...props }: Props) {
  const defaultClassNames = {
    root: iconRoot[variant],
    icon: iconWrapper,
  };

  return (
    <ActionIcon
      size={size}
      unstyled
      {...props}
      variant={variant}
      classNames={mergeClassNames(defaultClassNames, classNames)}
    />
  );
}

export const IconButton = createPolymorphicComponent<'button', Props>(IconButtonComponent);
