'use client';

import Button from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          background: colors.bg,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
      </body>
    </html>
  );
}
