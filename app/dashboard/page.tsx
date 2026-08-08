'use client';

import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import LevelTile from '@/components/ui/tiles/LevelTile';
import TotalWeightMovedTile from '@/components/ui/tiles/LevelTile';
import WeeklyWorkoutDataTile from '@/components/ui/tiles/WeeklyWorkoutDataTile';
import WeeklyWorkoutTile from '@/components/ui/tiles/WeeklyWorkoutTile';
import { createClient } from '@/lib/supabase/client';
import { s, useResponsive } from '@/lib/useResponsive';
import { getUserData, ReturnGetUserData } from '@/services/userData';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const supabase = createClient();
  const { isMobile, scale } = useResponsive();

  const [userData, setUserData] = useState<ReturnGetUserData>({
    experience: 0,
    weekly_distance_goal_meters: 0,
    weekly_duration_goal_minutes: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  const gridGap = s(isMobile ? 14 : 24, scale);
  const leftColumnWidth = s(600, scale);
  const rightColumnWidth = s(350, scale);
  const contentMaxWidth = isMobile
    ? 420
    : leftColumnWidth + rightColumnWidth + gridGap;

  const gridColumns = isMobile
    ? '1fr'
    : `${leftColumnWidth}px ${rightColumnWidth}px`;

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const data = await getUserData(user.id);
      console.log('Dashboard', data);
      setUserData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data.');
    } finally {
      setIsLoadingUserData(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'transparent',
        padding: s(isMobile ? 18 : 24, scale),
        display: 'flex',
        flexDirection: 'column',
        gap: s(20, scale),
        alignItems: isMobile ? 'stretch' : 'center',
      }}
    >
      {/* STICKY HEADER */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%',
          maxWidth: contentMaxWidth,
          padding: `${s(12, scale)}px 0`,
          backdropFilter: 'blur(12px)',
          background: colors.tileBg,
          borderRadius: s(18, scale),
        }}
      >
        <h1
          style={{
            margin: 10,
            color: 'white',
            fontSize: s(
              isMobile ? fontSizes.heading1 : fontSizes.display,
              scale
            ),
            fontWeight: 700,
          }}
        >
          Welcome back
        </h1>
      </div>

      {/* GRID */}
      {isLoadingUserData ? (
        <div
          style={{
            width: '100%',
            maxWidth: contentMaxWidth,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: s(300, scale),
          }}
        >
          <LoadingCircle />
        </div>
      ) : (
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
          <div style={{ gridColumn: isMobile ? 'auto' : 1 }}>
            <WeeklyWorkoutDataTile {...userData} />
          </div>
          <div style={{ gridColumn: isMobile ? 'auto' : 2 }}>
            <LevelTile {...userData} />
          </div>
          <div
            style={{
              gridColumn: isMobile ? 'auto' : 1,
              justifySelf: isMobile ? 'stretch' : 'start',
            }}
          >
            <WeeklyWorkoutTile workoutDays={{}} />
          </div>
        </div>
      )}
    </main>
  );
}
