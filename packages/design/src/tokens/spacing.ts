export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
} as const;

export const radius = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  pill: '9999px',
} as const;

export type SpacingTokens = typeof spacing;
export type RadiusTokens = typeof radius;
