import type { HTMLAttributes } from 'react';
import './StatusDot.css';

export type StatusDotState =
  | 'muted'
  | 'constructive'
  | 'warning'
  | 'danger'
  | 'info'
  | 'claude'
  | 'skill'
  | 'pulse';

export type StatusDotProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  state?: StatusDotState;
  label?: string;
};

export const StatusDot = ({
  state = 'muted',
  label,
  className,
  ...rest
}: StatusDotProps) => {
  const classes = [
    'tk-statusdot',
    `tk-statusdot--${state}`,
    className ?? null,
  ]
    .filter((token): token is string => Boolean(token))
    .join(' ');

  return <span className={classes} role="status" aria-label={label ?? state} {...rest} />;
};
