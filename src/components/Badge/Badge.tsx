import type { ReactElement, ReactNode } from 'react';
import cx from 'clsx';
import { InfoIcon } from '../../icons/InfoIcon';
import { WarningIcon } from '../../icons/WarningIcon';
import { StepCheckIcon } from '../../icons/StepCheckIcon';
import { ErrorIcon } from '../../icons/ErrorIcon';
import { visuallyHidden } from '../../theme';
import { badgeRoot, badgeIcon } from './Badge.css';

export type BadgeStatus = 'info' | 'success' | 'warning' | 'error';

interface BadgeCommonProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export interface BadgeNeutralProps {
  status?: undefined;
  /** The neutral variant has no inherent icon, so the caller picks whichever fits. */
  icon?: ReactElement;
  showIcon?: never;
  statusLabel?: never;
}

export interface BadgeStatusProps {
  /** Presentational — the label text should carry the status meaning; `statusLabel` is the escape hatch when it can't. */
  status: BadgeStatus;
  /** Toggles the status's own fixed icon — not a custom-icon slot, since the icon shape is part of how status is conveyed without relying on color alone. */
  showIcon?: boolean;
  icon?: never;
  /** Announces the status to assistive tech ahead of the label, for labels that don't state it themselves. `true` uses the Finnish default. */
  statusLabel?: string | true;
}

export type BadgeProps = BadgeCommonProps & (BadgeNeutralProps | BadgeStatusProps);

const statusLabels: Record<BadgeStatus, string> = {
  info: 'Tiedote',
  success: 'Valmis',
  warning: 'Varoitus',
  error: 'Virhe',
};

const statusIcons: Record<BadgeStatus, ReactElement> = {
  info: <InfoIcon aria-hidden />,
  success: <StepCheckIcon aria-hidden />,
  warning: <WarningIcon aria-hidden />,
  error: <ErrorIcon aria-hidden />,
};

/** A non-interactive status/category label — no hover, focus, or dismiss/selection affordance. For an interactive filter toggle or removable tag, use `Chip` instead. */
export function Badge(props: BadgeProps) {
  const { children, className, status, statusLabel, 'data-testid': dataTestId } = props;
  const icon = status ? (props.showIcon ? statusIcons[status] : undefined) : props.icon;
  const announced =
    status && statusLabel ? (statusLabel === true ? statusLabels[status] : statusLabel) : undefined;

  return (
    <span className={cx(badgeRoot, className)} data-status={status} data-testid={dataTestId}>
      {/* Trailing space so the status isn't announced as one word with the label. */}
      {announced && <span className={visuallyHidden}>{announced} </span>}
      {icon && <span className={badgeIcon}>{icon}</span>}
      {children}
    </span>
  );
}
