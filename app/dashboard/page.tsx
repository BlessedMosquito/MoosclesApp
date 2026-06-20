'use client';

import { useRouter } from 'next/navigation';
import Tile from '@/components/ui/Tile';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

const miniWeekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getMiniMonthDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const days: Array<number | null> = [];

  for (let index = 0; index < leadingDays; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(day);
  }

  while (days.length < 42) {
    days.push(null);
  }

  return days;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isMobile, isTablet, scale } = useResponsive();
  const contentMaxWidth = isMobile ? 420 : isTablet ? 760 : 980;
  const gridColumns = isMobile
    ? 'repeat(2, minmax(0, 1fr))'
    : 'repeat(3, minmax(0, 1fr))';
  const today = new Date();
  const currentDay = today.getDate();
  const monthLabel = today.toLocaleDateString('en-US', { month: 'short' });
  const miniMonthDays = getMiniMonthDays(today);

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: colors.background,

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
        Dashboard
      </h1>

      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: s(isMobile ? 14 : 24, scale),
          maxWidth: contentMaxWidth,
        }}
      >
        <Tile
          title="Start Workout"
          subtitle="Track your training session"
          onClick={() => router.push('/add-workout')}
        ></Tile>

        <Tile title="Weekly Progress" subtitle="4 workouts completed" />

        <Tile title="Calendar" onClick={() => router.push('/calendar')}>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: s(isMobile ? 3 : 5, scale),
            }}
          >
            <p
              style={{
                margin: 0,
                color: colors.text,
                fontSize: s(isMobile ? 9 : 11, scale),
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {monthLabel}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: isMobile ? 1 : s(2, scale),
              }}
            >
              {miniWeekdays.map((weekday, index) => (
                <span
                  key={`${weekday}-${index}`}
                  style={{
                    color: colors.textMuted,
                    fontSize: s(isMobile ? 5 : 7, scale),
                    textAlign: 'center',
                    lineHeight: 1,
                  }}
                >
                  {weekday}
                </span>
              ))}

              {miniMonthDays.map((day, index) => (
                <span
                  key={`${day ?? 'empty'}-${index}`}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 999,
                    background:
                      day === currentDay ? colors.text : 'transparent',
                    color:
                      day === currentDay
                        ? colors.background
                        : colors.textSecondary,
                    fontSize: s(isMobile ? 5 : 7, scale),
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </Tile>

        <Tile title="Current Streak" subtitle="12 days" />
      </div>
    </main>
  );
}
