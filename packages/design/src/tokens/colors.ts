export const colors = {
  bg: {
    primary: '#0f0f12',
    elevated: '#16161b',
    panel: '#1b1b22',
    input: '#212128',
    hover: '#24242c',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.18)',
  },
  text: {
    primary: '#f4f4f5',
    secondary: '#a1a1aa',
    muted: '#71717a',
    inverse: '#0f0f12',
  },
  accent: {
    base: '#d9f25f',
    strong: '#c8e548',
    soft: 'rgba(217, 242, 95, 0.16)',
    ink: '#16160a',
  },
  semantic: {
    success: '#4ade80',
    successSoft: 'rgba(74, 222, 128, 0.18)',
    error: '#ef4444',
    errorSoft: 'rgba(239, 68, 68, 0.18)',
    warning: '#f59e0b',
    warningSoft: 'rgba(245, 158, 11, 0.2)',
    info: '#60a5fa',
    infoSoft: 'rgba(96, 165, 250, 0.2)',
    skill: '#a78bfa',
    skillSoft: 'rgba(167, 139, 250, 0.2)',
    claude: '#f2c94c',
    muted: '#6b7280',
  },
} as const;

export type ColorTokens = typeof colors;
