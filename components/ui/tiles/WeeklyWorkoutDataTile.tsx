import { s, useResponsive } from '@/lib/useResponsive';
import Tile from './Tile';
import { colors } from '@/theme/colors';
import CircularProgress from '../CircularProgress';
import { getUserData, ReturnGetUserData } from '@/services/userData';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import ErrorPopUp from '../feedback/ErrorPopUp';
import { getWeeklyDataSummary } from '@/services/workoutMetrics';

export default function WeeklyWorkoutDataTile(userData: ReturnGetUserData) {
  const supabase = createClient();

  const { isMobile, scale } = useResponsive();
  const width = isMobile ? 420 : 600;
  const height = isMobile ? 220 : 350;

  const [weeklyDistanceGoal, setWeeklyDistanceGoal] = useState(0);
  const [weeklyDurationGoal, setWeeklyDurationGoal] = useState(0);
  const [weeklyDistance, setWeeklyDistance] = useState(0);
  const [weeklyDuration, setWeeklyDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setWeeklyDistanceGoal(userData.weekly_distance_goal_meters / 1000);
      setWeeklyDurationGoal(userData.weekly_duration_goal_minutes / 60);

      const weeklyData = await getWeeklyDataSummary({ userId: user.id });
      setWeeklyDistance(Number(weeklyData.distance_meters) / 1000);
      setWeeklyDuration(weeklyData.duration_minutes / 60);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data.');
    }
  }

  return (
    <Tile width={width} height={height}>
      <p
        style={{
          margin: 0,
          fontSize: s(isMobile ? 12 : 14, scale),
          fontWeight: 800,
          color: colors.text,
        }}
      >
        Your Weekly Summary!
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: s(6, scale),
          marginTop: s(15, scale),
        }}
      >
        <CircularProgress
          title="Duration"
          value={weeklyDuration}
          min={0}
          max={weeklyDurationGoal}
          unit="hours"
        />

        <CircularProgress
          title="Distance"
          value={weeklyDistance}
          min={0}
          max={weeklyDistanceGoal}
          unit="km"
        />
      </div>
    </Tile>
  );
}
