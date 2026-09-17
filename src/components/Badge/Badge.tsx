import type { ReactElement, ReactNode } from 'react';
import cx from 'clsx';
import { InfoIcon } from '../../icons/InfoIcon';
import { WarningIcon } from '../../icons/WarningIcon';
import { StepCheckIcon } from '../../icons/StepCheckIcon';
import { ErrorIcon } from '../../icons/ErrorIcon';
import { badgeRoot, badgeIcon } from './Badge.css';

export type BadgeStatus = 'info' | 'success' | 'warning' | 'error';

interface BadgeCommonProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export interface BadgeNeutralProps {
  status?: undefined;
  /** No status has no inherent icon, so the caller picks whichever fits. */
  icon?: ReactElement;
}

export interface BadgeStatusProps {
  status: BadgeStatus;
  /** Toggles the status's own fixed icon — not a custom-icon slot, since the icon shape is part of how status is conveyed without relying on color alone. */
  icon?: boolean;
}

export type BadgeProps = BadgeCommonProps & (BadgeNeutralProps | BadgeStatusProps);

const statusIcons: Record<BadgeStatus, ReactElement> = {
  info: <InfoIcon aria-hidden />,
  success: <StepCheckIcon aria-hidden />,
  warning: <WarningIcon aria-hidden />,
  error: <ErrorIcon aria-hidden />,
};

/** A non-interactive status/category label — no hover, focus, or dismiss/selection affordance. For an interactive filter toggle or removable tag, use `Chip` instead. */
export function Badge(props: BadgeProps) {
  const { children, className, 'data-testid': dataTestId } = props;
  const icon = props.status ? (props.icon ? statusIcons[props.status] : undefined) : props.icon;

  return (
    <span className={cx(badgeRoot, className)} data-status={props.status} data-testid={dataTestId}>
      {icon && <span className={badgeIcon}>{icon}</span>}
      {children}
    </span>
  );
}
