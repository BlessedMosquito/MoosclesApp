'use client';

import Tile from './Tile';
import CircularProgress from '../CircularProgress';
import { getWeeklyDataSummary } from '@/services/workoutMetrics';
import { useEffect, useState } from 'react';

type Props = {
  weekly_distance_goal_meters: number;
  userId: string;
  tileWidth: number;
  tileHeight: number;
};

export default function DistanceTile({
  weekly_distance_goal_meters,
  userId,
  tileWidth,
  tileHeight,
}: Props) {
  const [distanceKm, setDistanceKm] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const data = await getWeeklyDataSummary({ userId });
        setDistanceKm(Number(data.distance_meters) / 1000);
      } catch {
        setDistanceKm(0);
      }
    }
    load();
  }, [userId]);

  const goalKm = weekly_distance_goal_meters / 1000;
  const display = `${Math.round(distanceKm * 100) / 100} km`;
  const circleSize = tileWidth * 0.62;

  return (
    <Tile width={tileWidth} height={tileHeight}>
      <CircularProgress
        title="Distance"
        value={distanceKm}
        min={0}
        max={goalKm}
        displayValue={display}
        rangeLabel={`0 – ${goalKm} km`}
        size={circleSize}
      />
    </Tile>
  );
}