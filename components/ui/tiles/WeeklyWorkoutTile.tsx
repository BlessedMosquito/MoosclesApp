'use client';

import { colors } from '@/theme/colors';
import { s, useResponsive } from '@/lib/useResponsive';
import Tile from './Tile';

type Props = {
  workoutDays: Record<string, boolean>;
  workoutsThisWeek?: number;
  activeWeeks?: number;
  weekDates?: Date[];
};

function toKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
  activeWeeks = 0,
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

                background: hasWorkout ? colors.limeGreen : colors.componentsBg,

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
                  color: colors.text,
                }}
              >
                {weekdays[index]}
              </span>

              <span
                style={{
                  fontSize: s(12, scale),
                  lineHeight: 1,
                  fontWeight: 800,
                  color: colors.text,
                }}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: s(isMobile ? 9 : 11, scale),
          color: colors.textMuted,
          textAlign: 'center',
          marginTop: s(8, scale),
        }}
      >
        You have{' '}
        <span style={{ color: colors.limeGreen, fontWeight: 700 }}>
          {activeWeeks} {activeWeeks === 1 ? 'week' : 'weeks'}
        </span>{' '}
        streak with at least one day spent working out
      </p>
    </Tile>
  );
}
