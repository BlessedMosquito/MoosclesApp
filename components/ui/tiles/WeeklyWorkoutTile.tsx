'use client';

import { colors } from '@/theme/colors';
import { s, useResponsive } from '@/lib/useResponsive';
import Tile from './Tile';

type Props = {
  workoutDays: Record<string, boolean>; // "YYYY-MM-DD": true
  workoutsThisWeek?: number;
  weekDates?: Date[]; // 7 dni tygodnia
};

function toKey(date: Date) {
  return date.toISOString().split('T')[0];
}

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
  weekDates = getCurrentWeekDates(),
}: Props) {
  const { isMobile, scale } = useResponsive();

  const todayKey = toKey(new Date());

  return (
    <Tile width={350} height={180}>
      {/* HEADER */}
      <div style={{ marginBottom: s(10, scale) }}>
        <p
          style={{
            margin: 0,
            fontSize: s(isMobile ? 12 : 14, scale),
            fontWeight: 800,
            color: colors.text,
          }}
        >
          Your Weekly streak!
        </p>

        <p
          style={{
            margin: `${s(4, scale)}px 0 0`,
            fontSize: s(isMobile ? 10 : 12, scale),
            color: colors.text,
          }}
        >
          You’ve done{' '}
          <span style={{ color: '#30D158', fontWeight: 700 }}>
            {workoutsThisWeek}
          </span>{' '}
          workouts this week
        </p>
      </div>

      {/* WEEK GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: s(6, scale),
        }}
      >
        {weekDates.map((date, index) => {
          const key = toKey(date);
          const isToday = key === todayKey;
          const hasWorkout = !!workoutDays[key];

          return (
            <div
              key={key}
              style={{
                width: '100%',
                minHeight: s(isMobile ? 76 : 56, scale),
                borderRadius: 999,

                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: s(3, scale),

                background: hasWorkout
                  ? 'rgba(48, 209, 88, 0.3)'
                  : colors.componentsBg,

                border: isToday
                  ? `1px solid ${colors.text}`
                  : `1px solid ${colors.border}`,

                color: hasWorkout ? '#30D158' : colors.textMuted,
                marginTop: s(10, scale),
              }}
            >
              <span
                style={{
                  fontSize: s(9, scale),
                  lineHeight: 1,
                  fontWeight: 700,
                }}
              >
                {weekdays[index]}
              </span>

              <span
                style={{
                  fontSize: s(12, scale),
                  lineHeight: 1,
                  fontWeight: 800,
                }}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </Tile>
  );
}
