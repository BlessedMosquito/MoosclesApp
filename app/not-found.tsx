'use client';

import { colors } from '@/theme/colors';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
      }}
    >
      <h1
        style={{
          margin: 0,
          color: colors.text,
          fontSize: 120,
          fontWeight: 800,
          opacity: 0.3,
          userSelect: 'none',
        }}
      >
        404
      </h1>
    </main>
  );
}

