import type { InputHTMLAttributes } from 'react';
import './TextInput.css';
import './SearchInput.css';

export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

const SearchIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SearchInput = ({ className, placeholder = 'Search...', ...rest }: SearchInputProps) => {
  const wrapperClasses = ['tk-searchinput', className ?? null]
    .filter((token): token is string => Boolean(token))
    .join(' ');

  return (
    <div className={wrapperClasses}>
      <span className="tk-searchinput__icon" aria-hidden="true">
        <SearchIcon />
      </span>
      <input type="search" className="tk-textinput tk-searchinput__input" placeholder={placeholder} {...rest} />
    </div>
  );
};
