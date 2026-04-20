import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { BadgeSize, BadgeVariant } from './Badge.js';
import { cx } from './cx.js';
import './Badge.css';
import './ClickableBadge.css';

export type ClickableBadgeProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
};

export const ClickableBadge = ({
  variant = 'default',
  size = 'medium',
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ClickableBadgeProps) => (
  <button
    type={type}
    className={cx(
      'tk-badge',
      'tk-badge--clickable',
      `tk-badge--${variant}`,
      `tk-badge--size-${size}`,
      className,
    )}
    {...rest}
  >
    {icon ? <span className="tk-badge__icon">{icon}</span> : null}
    <span className="tk-badge__label">{children}</span>
  </button>
);
