export const spring = { type: 'spring', bounce: 0, duration: 0.35 } as const;

export const springMomentum = {
  type: 'spring',
  bounce: 0.2,
  duration: 0.35,
} as const;

export const fade = { duration: 0.2, ease: 'easeOut' } as const;

export const press = { duration: 0.1, ease: 'easeOut' } as const;

export const PRESS_SCALE = 0.97;
