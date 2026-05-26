export const fonts = {
  sans: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
  mono: 'var(--font-geist-mono), monospace',
};

export const fontSizes = {
  display: 34,
  heading1: 28,
  heading2: 22,
  body: 16,
  bodySmall: 14,
  caption: 12,
  button: 16,
  input: 16,
} as const;

export const typography = {
  display: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.display,
    fontWeight: 700,
    lineHeight: 1.15,
  },

  heading1: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.heading1,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  heading2: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.heading2,
    fontWeight: 700,
    lineHeight: 1.25,
  },

  body: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.body,
    fontWeight: 400,
    lineHeight: 1.5,
  },

  bodySmall: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.bodySmall,
    fontWeight: 400,
    lineHeight: 1.45,
  },

  caption: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.caption,
    fontWeight: 400,
    lineHeight: 1.35,
  },

  button: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.button,
    fontWeight: 600,
    lineHeight: 1,
  },

  input: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.input,
    fontWeight: 400,
    lineHeight: 1.25,
  },
};
