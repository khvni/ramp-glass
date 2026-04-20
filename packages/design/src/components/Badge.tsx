import type { HTMLAttributes, ReactNode } from 'react';
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
}: BadgeProps) => {
  const classes = [
    'tk-badge',
    `tk-badge--${variant}`,
    `tk-badge--size-${size}`,
    className ?? null,
  ]
    .filter((token): token is string => Boolean(token))
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {icon ? <span className="tk-badge__icon">{icon}</span> : null}
      <span className="tk-badge__label">{children}</span>
    </span>
  );
};
