import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';
import './Badge.css';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'accent'
  | 'skill'
  | 'ghost';

export type BadgeSize = 'small' | 'medium';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
};

export const Badge = ({
  variant = 'default',
  size = 'medium',
  icon,
  className,
  children,
  ...rest
}: BadgeProps) => (
  <span
    className={cx('tk-badge', `tk-badge--${variant}`, `tk-badge--size-${size}`, className)}
    {...rest}
  >
    {icon ? <span className="tk-badge__icon">{icon}</span> : null}
    <span className="tk-badge__label">{children}</span>
  </span>
);
