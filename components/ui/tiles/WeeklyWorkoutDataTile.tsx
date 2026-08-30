'use client';

import { s, useResponsive } from '@/lib/useResponsive';
import Tile from './Tile';
import { colors } from '@/theme/colors';
import CircularProgress from '../CircularProgress';
import { getWeeklyDataSummary } from '@/services/workoutMetrics';
import { useEffect, useState } from 'react';

type WeeklyData = {
  duration_minutes: number;
  distance_meters: number;
};

type Props = {
  weekly_distance_goal_meters: number;
  weekly_duration_goal_minutes: number;
  userId: string;
};

export default function WeeklyWorkoutDataTile({
  weekly_distance_goal_meters,
  weekly_duration_goal_minutes,
  userId,
}: Props) {
  const { isMobile, scale } = useResponsive();
  const width = isMobile ? 420 : 600;
  const height = isMobile ? 220 : 350;

  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    duration_minutes: 0,
    distance_meters: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getWeeklyDataSummary({ userId });
        setWeeklyData(data);
      } catch {
        setWeeklyData({ duration_minutes: 0, distance_meters: 0 });
      }
    }
    load();
  }, [userId]);

  const weeklyDistanceGoal = weekly_distance_goal_meters / 1000;
  const weeklyDurationGoal = weekly_duration_goal_minutes / 60;
  const totalMinutes = weeklyData.duration_minutes;
  const durationH = Math.floor(totalMinutes / 60);
  const durationM = Math.round(totalMinutes % 60);
  const durationDisplay = durationH > 0 ? `${durationH}h ${durationM}min` : `${durationM}min`;
  const distanceKm = Number(weeklyData.distance_meters) / 1000;
  const distanceDisplay = `${Math.round(distanceKm * 100) / 100} km`;

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
          value={totalMinutes}
          min={0}
          max={weeklyDurationGoal * 60}
          displayValue={durationDisplay}
          rangeLabel={`0 – ${weeklyDurationGoal}h`}
        />

        <CircularProgress
          title="Distance"
          value={distanceKm}
          min={0}
          max={weeklyDistanceGoal}
          displayValue={distanceDisplay}
          rangeLabel={`0 – ${weeklyDistanceGoal} km`}
        />
      </div>
    </Tile>
  );
}
