export const typography = {
  family: {
    sans: '"Inter", "Space Grotesk", "SF Pro Text", "Segoe UI", system-ui, sans-serif',
    mono: '"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
  },
  size: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '28px',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.6,
  },
  letterSpacing: {
    label: '0.08em',
    normal: '0',
  },
} as const;

export type TypographyTokens = typeof typography;
