'use client';

import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import LevelTile from '@/components/ui/tiles/LevelTile';
import DurationTile from '@/components/ui/tiles/DurationTile';
import DistanceTile from '@/components/ui/tiles/DistanceTile';
import WeeklyWorkoutTile from '@/components/ui/tiles/WeeklyWorkoutTile';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import { createClient } from '@/lib/supabase/client';
import { s, useResponsive } from '@/lib/useResponsive';
import { getUserData, ReturnGetUserData } from '@/services/userData';
import { getWorkoutDaysForWeek } from '@/services/workouts';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { useEffect, useState } from 'react';
import AddWorkoutTile from '@/components/ui/tiles/AddWorkoutTile';
import WaterTile from '@/components/ui/tiles/WaterTile';

export default function DashboardPage() {
  const supabase = createClient();
  const { isMobile, scale, width } = useResponsive();

  const [userData, setUserData] = useState<ReturnGetUserData>({
    experience: 0,
    weekly_distance_goal_meters: 0,
    weekly_duration_goal_minutes: 0,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [workoutDays, setWorkoutDays] = useState<Record<string, boolean>>({});
  const [workoutCount, setWorkoutCount] = useState(0);
  const [activeWeeks, setActiveWeeks] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);

  const gridGap = s(isMobile ? 12 : 24, scale);
  const paddingX = s(isMobile ? 18 : 24, scale);
  const availableWidth = Math.max(0, width - paddingX * 2);
  const tileWidth = isMobile
    ? Math.round(availableWidth * 0.48)
    : Math.min(s(290, scale), Math.floor((availableWidth - gridGap * 2) / 3));
  const tileHeight = s(isMobile ? 180 : 250, scale);
  const halfTileHeight = (tileHeight - gridGap) / 2;
  const contentMaxWidth =
    tileWidth * (isMobile ? 2 : 3) + gridGap * (isMobile ? 1 : 2);

  async function loadUserData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        return;
      }

      setUserId(user.id);
      setFirstName(user.user_metadata?.first_name ?? null);

      const [data, weekData] = await Promise.all([
        getUserData(user.id),
        getWorkoutDaysForWeek(user.id),
      ]);
      setUserData(data);

      const mapped: Record<string, boolean> = {};
      for (const d of weekData.workout_days) mapped[d.date] = true;
      setWorkoutDays(mapped);
      setWorkoutCount(weekData.workout_count);
      setActiveWeeks(weekData.active_weeks);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data.');
    } finally {
      setIsLoadingUserData(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          padding: `${s(12, scale)}px ${s(16, scale)}px`,
          backdropFilter: 'blur(12px)',
          background: colors.componentsBg,
          borderRadius: s(18, scale),
          border: `1px solid ${colors.accent}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            margin: 0,
            color: 'white',
            fontSize: s(isMobile ? 22 : 32, scale),
            fontWeight: 700,
          }}
        >
          Mooscles
        </h1>
        <p
          style={{
            margin: 0,
            color: colors.text,
            fontSize: s(isMobile ? fontSizes.bodySmall : fontSizes.body, scale),
            fontWeight: 600,
          }}
        >
          {`Hello, ${firstName ?? ''}`}
        </p>
      </div>

      {error && <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>}

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
      ) : isMobile ? (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: gridGap,
            maxWidth: contentMaxWidth,
          }}
        >
          <LevelTile
            {...userData}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: gridGap,
              width: tileWidth,
            }}
          >
            <AddWorkoutTile tileWidth={tileWidth} tileHeight={halfTileHeight} />
            <WaterTile tileWidth={tileWidth} tileHeight={halfTileHeight} />
          </div>
          <DurationTile
            weekly_duration_goal_minutes={userData.weekly_duration_goal_minutes}
            userId={userId ?? ''}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
          />
          <DistanceTile
            weekly_distance_goal_meters={userData.weekly_distance_goal_meters}
            userId={userId ?? ''}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
          />
          <div style={{ width: '100%' }}>
            <WeeklyWorkoutTile
              workoutDays={workoutDays}
              workoutsThisWeek={workoutCount}
              activeWeeks={activeWeeks}
              width={contentMaxWidth}
              height={tileHeight}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(3, minmax(0, 1fr))`,
            gap: gridGap,
            maxWidth: contentMaxWidth,
          }}
        >
          <LevelTile
            {...userData}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
          />
          <DurationTile
            weekly_duration_goal_minutes={userData.weekly_duration_goal_minutes}
            userId={userId ?? ''}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
          />
          <DistanceTile
            weekly_distance_goal_meters={userData.weekly_distance_goal_meters}
            userId={userId ?? ''}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: gridGap,
            }}
          >
            <AddWorkoutTile tileWidth={tileWidth} tileHeight={halfTileHeight} />
            <WaterTile tileWidth={tileWidth} tileHeight={halfTileHeight} />
          </div>
          <div
            style={{
              gridColumn: 'span 2',
            }}
          >
            <WeeklyWorkoutTile
              workoutDays={workoutDays}
              workoutsThisWeek={workoutCount}
              activeWeeks={activeWeeks}
              width={tileWidth * 2 + gridGap}
              height={tileHeight}
            />
          </div>
        </div>
      )}
    </main>
  );
}
