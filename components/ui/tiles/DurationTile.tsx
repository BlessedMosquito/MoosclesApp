'use client';

import Tile from './Tile';
import CircularProgress from '../CircularProgress';
import { getWeeklyDataSummary } from '@/services/workoutMetrics';
import { useEffect, useState } from 'react';

type Props = {
  weekly_duration_goal_minutes: number;
  userId: string;
  tileWidth: number;
  tileHeight: number;
};

export default function DurationTile({
  weekly_duration_goal_minutes,
  userId,
  tileWidth,
  tileHeight,
}: Props) {
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const data = await getWeeklyDataSummary({ userId });
        setTotalMinutes(data.duration_minutes);
      } catch {
        setTotalMinutes(0);
      }
    }
    load();
  }, [userId]);

  const goalHours = weekly_duration_goal_minutes / 60;
  const durationH = Math.floor(totalMinutes / 60);
  const durationM = Math.round(totalMinutes % 60);
  const display =
    durationH > 0 ? `${durationH}h ${durationM}min` : `${durationM}min`;
  const circleSize = tileWidth * 0.62;

  return (
    <Tile width={tileWidth} height={tileHeight}>
      <CircularProgress
        title="Duration"
        value={totalMinutes}
        min={0}
        max={goalHours * 60}
        displayValue={display}
        rangeLabel={`0 – ${goalHours}h`}
        size={circleSize}
      />
    </Tile>
  );
}
