'use client';

import { useRouter } from 'next/navigation';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

export default function AddWorkoutPage() {
  const router = useRouter();
  const { isMobile, scale } = useResponsive();

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: colors.background,
        padding: s(isMobile ? 18 : 24, scale),
        color: colors.text,
      }}
    >
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: s(14, scale),
          background: colors.surface,
          color: colors.text,
          padding: `${s(10, scale)}px ${s(14, scale)}px`,
          fontSize: s(fontSizes.bodySmall, scale),
          cursor: 'pointer',
        }}
      >
        Back
      </button>

      <section
        style={{
          marginTop: s(28, scale),
          maxWidth: 720,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: s(isMobile ? fontSizes.heading1 : fontSizes.display, scale),
            fontWeight: 700,
          }}
        >
          Add Workout
        </h1>

        <p
          style={{
            margin: `${s(12, scale)}px 0 0`,
            color: colors.textSecondary,
            fontSize: s(fontSizes.body, scale),
            lineHeight: 1.5,
          }}
        >
          Start building your next training session.
        </p>
      </section>
    </main>
  );
}
