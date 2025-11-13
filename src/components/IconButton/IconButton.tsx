import { ActionIcon, type ActionIconProps, createPolymorphicComponent } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { iconWrapper, iconRoot } from './IconButton.css.ts';

type IconButtonVariant = 'light' | 'dark';
type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface Props extends ActionIconProps, PropsWithChildren {
  variant?: IconButtonVariant;
  size: IconButtonSize;
}

function IconButtonComponent({ variant = 'light', size, ...props }: Props) {
  return (
    <ActionIcon
      size={size}
      unstyled
      {...props}
      variant={variant}
      classNames={{ root: iconRoot[variant], icon: iconWrapper }}
    />
  );
}

export const IconButton = createPolymorphicComponent<'button', Props>(IconButtonComponent);
