'use client';

import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import Button from '@/components/ui/Button';

type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          padding: 32,
          borderRadius: 20,
          border: `1px solid ${colors.errorBorder}`,
          background: colors.errorSurface,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: colors.errorMuted,
            fontSize: fontSizes.heading2,
            fontWeight: 700,
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            margin: 0,
            color: colors.errorMuted,
            fontSize: fontSizes.bodySmall,
            lineHeight: 1.5,
          }}
        >
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
