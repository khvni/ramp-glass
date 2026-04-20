import type { InputHTMLAttributes } from 'react';
import { cx } from './cx.js';
import './TextInput.css';

export type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export const TextInput = ({ className, type = 'text', ...rest }: TextInputProps) => (
  <input type={type} className={cx('tk-textinput', className)} {...rest} />
);
