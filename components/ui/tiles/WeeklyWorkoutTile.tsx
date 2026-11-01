'use client';

import { toDateKey } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import Tile from './Tile';

type Props = {
  workoutDays: Record<string, boolean>;
  workoutsThisWeek?: number;
  activeWeeks?: number;
  weekDates?: Date[];
  width?: number;
  height?: number;
};

function getCurrentWeekDates() {
  const today = new Date();
  const monday = new Date(today);
  const dayOffset = (today.getDay() + 6) % 7;

  monday.setDate(today.getDate() - dayOffset);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeeklyStreakTile({
  workoutDays,
  workoutsThisWeek = Object.values(workoutDays).filter(Boolean).length,
  activeWeeks = 0,
  weekDates = getCurrentWeekDates(),
  width = 350,
  height = 180,
}: Props) {
  const todayKey = toDateKey(new Date());

  return (
    <Tile width={width} height={height}>
      <div className="mb-2.5">
        <p className="streak-title">Your Weekly streak!</p>
        <p className="streak-subtitle">
          You’ve done{' '}
          <span className="streak-highlight-success">{workoutsThisWeek}</span>{' '}
          workouts this week
        </p>
      </div>

      <div className="streak-week">
        {weekDates.map((date, index) => {
          const key = toDateKey(date);

          return (
            <div
              key={key}
              className={cn(
                'streak-day',
                workoutDays[key] && 'streak-day-done',
                key === todayKey && 'streak-day-today'
              )}
            >
              <span className="streak-day-name">{weekdays[index]}</span>
              <span className="streak-day-number">{date.getDate()}</span>
            </div>
          );
        })}
      </div>

      <p className="streak-footer">
        You have{' '}
        <span className="streak-highlight">
          {activeWeeks} {activeWeeks === 1 ? 'week' : 'weeks'}
        </span>{' '}
        streak with at least one day spent working out
      </p>
    </Tile>
  );
}
