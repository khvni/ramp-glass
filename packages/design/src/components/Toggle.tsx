import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx.js';
import './Toggle.css';

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> & {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
};

export const Toggle = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
  ...rest
}: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    className={cx(
      'tk-toggle',
      checked ? 'tk-toggle--on' : 'tk-toggle--off',
      disabled && 'tk-toggle--disabled',
      className,
    )}
    onClick={() => {
      if (!disabled) onChange(!checked);
    }}
    {...rest}
  >
    <span className="tk-toggle__knob" />
  </button>
);
