import type { ButtonHTMLAttributes } from 'react';
import './Toggle.css';

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> & {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  dim?: boolean;
};

export const Toggle = ({
  checked,
  onChange,
  label,
  disabled = false,
  dim = false,
  className,
  ...rest
}: ToggleProps) => {
  const classes = [
    'tk-toggle',
    checked ? 'tk-toggle--on' : 'tk-toggle--off',
    disabled ? 'tk-toggle--disabled' : null,
    dim ? 'tk-toggle--dim' : null,
    className ?? null,
  ]
    .filter((token): token is string => Boolean(token))
    .join(' ');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={classes}
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
      {...rest}
    >
      <span className="tk-toggle__knob" />
    </button>
  );
};
