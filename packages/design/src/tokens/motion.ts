export const motion = {
  duration: {
    fast: '120ms',
    base: '160ms',
    slow: '240ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  },
} as const;

export type MotionTokens = typeof motion;
