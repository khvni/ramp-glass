import type { TextareaHTMLAttributes } from 'react';
import { cx } from './cx.js';
import './Textarea.css';

export type TextareaResize = 'none' | 'vertical';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  resize?: TextareaResize;
};

export const Textarea = ({
  className,
  resize = 'vertical',
  rows = 4,
  ...rest
}: TextareaProps) => (
  <textarea
    rows={rows}
    className={cx('tk-textarea', `tk-textarea--resize-${resize}`, className)}
    {...rest}
  />
);
