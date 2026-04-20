import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';
import './IconButton.css';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type IconButtonSize = 's' | 'm' | 'l';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: ReactNode;
  label: string;
};

export const IconButton = ({
  variant = 'secondary',
  size = 'm',
  icon,
  label,
  className,
  disabled,
  type = 'button',
  ...rest
}: IconButtonProps) => (
  <button
    type={type}
    className={cx(
      'tk-iconbutton',
      `tk-iconbutton--${variant}`,
      `tk-iconbutton--size-${size}`,
      disabled && 'tk-iconbutton--disabled',
      className,
    )}
    aria-label={label}
    title={label}
    disabled={disabled}
    {...rest}
  >
    <span className="tk-iconbutton__icon" aria-hidden="true">
      {icon}
    </span>
  </button>
);
