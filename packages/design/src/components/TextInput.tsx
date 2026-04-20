import type { InputHTMLAttributes } from 'react';
import './TextInput.css';

export type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export const TextInput = ({ className, type = 'text', ...rest }: TextInputProps) => {
  const classes = ['tk-textinput', className ?? null]
    .filter((token): token is string => Boolean(token))
    .join(' ');

  return <input type={type} className={classes} {...rest} />;
};
