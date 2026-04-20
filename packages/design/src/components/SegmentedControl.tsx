import type { ReactNode } from 'react';
import './SegmentedControl.css';

export type SegmentedControlOption<Value extends string> = {
  value: Value;
  label: ReactNode;
};

export type SegmentedControlProps<Value extends string> = {
  options: ReadonlyArray<SegmentedControlOption<Value>>;
  value: Value;
  onChange: (next: Value) => void;
  label?: string;
  className?: string;
};

export const SegmentedControl = <Value extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<Value>) => {
  const classes = ['tk-segmented', className ?? null]
    .filter((token): token is string => Boolean(token))
    .join(' ');

  return (
    <div className={classes} role="tablist" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`tk-segmented__option${active ? ' tk-segmented__option--active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
