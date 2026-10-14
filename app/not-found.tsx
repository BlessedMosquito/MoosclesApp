'use client';

import Button from '@/components/ui/buttons/Button';
import { colors } from '@/theme/colors';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
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
        <Button onClick={() => router.push('/dashboard')}>Go back</Button>
      </div>
    </main>
  );
}
