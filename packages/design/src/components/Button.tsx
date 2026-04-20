import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 's' | 'm';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export const Button = ({
  variant = 'primary',
  size = 'm',
  leadingIcon,
  trailingIcon,
  className,
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cx('tk-button', `tk-button--${variant}`, `tk-button--size-${size}`, disabled && 'tk-button--disabled', className)}
    disabled={disabled}
    {...rest}
  >
    {leadingIcon ? <span className="tk-button__icon">{leadingIcon}</span> : null}
    {children != null ? <span className="tk-button__label">{children}</span> : null}
    {trailingIcon ? <span className="tk-button__icon">{trailingIcon}</span> : null}
  </button>
);
