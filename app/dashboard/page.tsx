'use client';

import { useRouter } from 'next/navigation';
import Tile from '@/components/ui/Tile';    
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

export default function DashboardPage() {
  const router = useRouter();
  const { isMobile, isTablet, scale } = useResponsive();
  const contentMaxWidth = isMobile ? 420 : isTablet ? 760 : 980;
  const gridColumns = isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))';

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: colors.background,

        padding: s(isMobile ? 18 : 24, scale),

        display: 'flex',
        flexDirection: 'column',
        gap: s(20, scale),
        alignItems: isMobile ? 'stretch' : 'center',
      }}
    >
      <h1
        style={{
          width: '100%',
          maxWidth: contentMaxWidth,
          color: 'white',
          fontSize: s(isMobile ? fontSizes.heading1 : fontSizes.display, scale),
          fontWeight: 700,
        }}
      >
        Dashboard
      </h1>

      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: s(isMobile ? 14 : 24, scale),
          maxWidth: contentMaxWidth,
        }}
      >
        <Tile
          title="Start Workout"
          subtitle="Track your training session"
          onClick={() => router.push('/add-workout')}
        >
        </Tile>

        <Tile
          title="Weekly Progress"
          subtitle="4 workouts completed"
        />

        <Tile
          title="Current Streak"
          subtitle="12 days"
        />
      </div>
    </main>
  );
}
