'use client';

import TotalWeightMovedTile from '@/components/ui/tiles/TotalWeightMovedTile';
import WeeklyWorkoutDataTile from '@/components/ui/tiles/WeeklyWorkoutDataTile';
import WeeklyWorkoutTile from '@/components/ui/tiles/WeeklyWorkoutTile';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

export default function DashboardPage() {
  const { isMobile, scale } = useResponsive();

  const gridGap = s(isMobile ? 14 : 24, scale);
  const leftColumnWidth = s(600, scale);
  const rightColumnWidth = s(350, scale);
  const contentMaxWidth = isMobile
    ? 420
    : leftColumnWidth + rightColumnWidth + gridGap;

  const gridColumns = isMobile
    ? '1fr'
    : `${leftColumnWidth}px ${rightColumnWidth}px`;

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: colors.bg,
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
        Welcome back
      </h1>

      {/* GRID */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: gridColumns,
          alignItems: 'start',
          gap: gridGap,
          maxWidth: contentMaxWidth,
        }}
      >
        {/* TOP LEFT */}
        <div style={{ gridColumn: isMobile ? 'auto' : 1 }}>
          <WeeklyWorkoutDataTile />
        </div>

        {/* TOP RIGHT */}
        <div style={{ gridColumn: isMobile ? 'auto' : 2 }}>
          <TotalWeightMovedTile />
        </div>

        {/* BOTTOM RIGHT */}
        <div
          style={{
            gridColumn: isMobile ? 'auto' : 1,
            justifySelf: isMobile ? 'stretch' : 'start',
          }}
        >
          <WeeklyWorkoutTile workoutDays={{}} />
        </div>
      </div>
    </main>
  );
}
