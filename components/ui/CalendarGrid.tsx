'use client';

import { useMemo, useState } from 'react';
import LoadingCircle from '@/components/ui/LoadingCircle';
import PopupWindow from '@/components/ui/PopUpWindow';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { ReturnGetWorkoutsData } from '@/services/workouts';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const yearOptions = Array.from({ length: 21 }, (_, i) => 2010 + i);

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const days: Array<Date | null> = [];
  for (let i = 0; i < leadingDays; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

type CalendarGridProps = {
  workoutsByDay: Record<string, ReturnGetWorkoutsData[]>;
  selectedWorkout: ReturnGetWorkoutsData | null;
  isLoading: boolean;
  onSelectWorkout: (workout: ReturnGetWorkoutsData) => void;
  onClosePreview: () => void;
};

export default function CalendarGrid({
  workoutsByDay,
  selectedWorkout,
  isLoading,
  onSelectWorkout,
  onClosePreview,
}: CalendarGridProps) {
  const { isMobile, isTablet, scale } = useResponsive();
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [popupDay, setPopupDay] = useState<string | null>(null);
  const [popupWorkouts, setPopupWorkouts] = useState<ReturnGetWorkoutsData[]>([]);

  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const monthLabel = visibleMonth.toLocaleDateString('en-US', { month: 'long' });
  const visibleYear = visibleMonth.getFullYear();

  function changeMonth(offset: number) {
    setVisibleMonth(c => new Date(c.getFullYear(), c.getMonth() + offset, 1));
    onClosePreview();
  }

  function changeYear(year: number) {
    setVisibleMonth(c => new Date(year, c.getMonth(), 1));
    setIsYearPickerOpen(false);
    onClosePreview();
  }

  return (
    <section style={{
      marginTop: s(isMobile ? 16 : 24, scale),
      border: `1px solid ${colors.border}`,
      borderRadius: s(isMobile ? 16 : 20, scale),
      background: colors.surface,
      padding: s(isMobile ? 8 : 18, scale),
    }}>
      {/* nawigacja */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: s(isMobile ? 10 : 16, scale),
      }}>
        <button type="button" onClick={() => changeMonth(-1)} style={{
          border: `1px solid ${colors.border}`,
          borderRadius: s(12, scale),
          background: colors.glass,
          color: colors.text,
          width: s(isMobile ? 32 : 38, scale),
          height: s(isMobile ? 32 : 38, scale),
          cursor: 'pointer',
        }}>{'<'}</button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(4, scale) }}>
          <button type="button" onClick={() => setIsYearPickerOpen(v => !v)} style={{
            border: 'none',
            background: 'transparent',
            color: colors.text,
            padding: 0,
            fontSize: s(isMobile ? fontSizes.heading1 : fontSizes.display, scale),
            fontWeight: 700,
            lineHeight: 1,
            cursor: 'pointer',
          }}>
            {visibleYear}
          </button>
          <h2 style={{ margin: 0, fontSize: s(isMobile ? fontSizes.body : fontSizes.heading2, scale) }}>
            {monthLabel}
          </h2>
        </div>

        <button type="button" onClick={() => changeMonth(1)} style={{
          border: `1px solid ${colors.border}`,
          borderRadius: s(12, scale),
          background: colors.glass,
          color: colors.text,
          width: s(isMobile ? 32 : 38, scale),
          height: s(isMobile ? 32 : 38, scale),
          cursor: 'pointer',
        }}>{'>'}</button>
      </div>

      {isYearPickerOpen ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: s(isMobile ? 8 : 12, scale) }}>
          {yearOptions.map(year => (
            <button key={year} type="button" onClick={() => changeYear(year)} style={{
              minHeight: s(isMobile ? 54 : 72, scale),
              border: `2px solid ${year === visibleYear ? colors.text : colors.border}`,
              borderRadius: s(14, scale),
              background: year === visibleYear ? colors.glassHover : colors.glass,
              color: colors.text,
              fontSize: s(isMobile ? fontSizes.body : fontSizes.heading2, scale),
              fontWeight: year === visibleYear ? 700 : 500,
              cursor: 'pointer',
            }}>
              {year}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: s(isMobile ? 3 : 6, scale) }}>
          {weekdays.map(weekday => (
            <div key={weekday} style={{
              color: colors.textMuted,
              fontSize: s(fontSizes.caption, scale),
              textAlign: 'center',
              paddingBottom: s(isMobile ? 2 : 4, scale),
            }}>
              {weekday}
            </div>
          ))}

          {monthDays.map((day, index) => {
            const key = day ? toDateKey(day) : `empty-${index}`;
            const dayWorkouts = day ? workoutsByDay[toDateKey(day)] ?? [] : [];
            const visibleWorkouts = dayWorkouts.slice(0, isMobile ? 1 : 2);
            const remainingWorkouts = dayWorkouts.length - visibleWorkouts.length;
            const hasWorkouts = dayWorkouts.length > 0;

            return (
              <div key={key}
                role={hasWorkouts ? 'button' : undefined}
                tabIndex={hasWorkouts ? 0 : undefined}
                onClick={() => { if (hasWorkouts) {
                    onSelectWorkout(dayWorkouts[0]);
                } else {
                    onClosePreview();
                }
                }}
                onKeyDown={e => { if (hasWorkouts && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelectWorkout(dayWorkouts[0]); } }}
                style={{
                  minHeight: s(isMobile ? 54 : 112, scale),
                  borderRadius: s(isMobile ? 8 : 12, scale),
                  border: `1px solid ${day ? colors.border : 'transparent'}`,
                  background: day ? 'rgba(255,255,255,0.025)' : 'transparent',
                  padding: s(isMobile ? 3 : 6, scale),
                  overflow: 'hidden',
                  cursor: hasWorkouts ? 'pointer' : 'default',
                }}
              >
                {day && (
                  <>
                    <p style={{ margin: 0, color: colors.textSecondary, fontSize: s(isMobile ? 10 : fontSizes.caption, scale) }}>
                      {day.getDate()}
                    </p>
                    <div style={{ marginTop: s(6, scale), display: 'flex', flexDirection: 'column', gap: s(isMobile ? 2 : 5, scale) }}>
                      {visibleWorkouts.map(workout => (
                        <button key={workout.id} type="button"
                          onClick={e => { e.stopPropagation(); onSelectWorkout(workout); }}
                          style={{
                            width: '100%',
                            border: `1px solid ${colors.borderStrong}`,
                            borderRadius: s(isMobile ? 6 : 8, scale),
                            background: selectedWorkout?.id === workout.id ? colors.glassHover : colors.glass,
                            color: colors.text,
                            padding: `${s(isMobile ? 2 : 5, scale)}px ${s(isMobile ? 3 : 6, scale)}px`,
                            fontSize: s(isMobile ? 8 : 11, scale),
                            textAlign: 'left',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {workout.name}
                        </button>
                      ))}

                      {remainingWorkouts > 0 && (
                        <button type="button"
                          onClick={e => { e.stopPropagation(); setPopupDay(key); setPopupWorkouts(dayWorkouts); }}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: colors.textMuted,
                            fontSize: s(isMobile ? 8 : 11, scale),
                            textAlign: 'left',
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          +{remainingWorkouts} more
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: s(16, scale) }}>
          <LoadingCircle />
        </div>
      )}

      {popupDay && (
        <PopupWindow title={popupDay} onClose={() => setPopupDay(null)}>
          {popupWorkouts.map(workout => (
            <button key={workout.id} type="button"
              onClick={() => { setPopupDay(null); onSelectWorkout(workout); }}
              style={{
                width: '100%',
                border: `1px solid ${selectedWorkout?.id === workout.id ? colors.borderStrong : colors.border}`,
                borderRadius: s(12, scale),
                background: selectedWorkout?.id === workout.id ? colors.glassHover : colors.glass,
                color: colors.text,
                padding: s(12, scale),
                fontSize: s(fontSizes.bodySmall, scale),
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>{workout.name}</p>
              <p style={{ margin: `${s(2, scale)}px 0 0`, color: colors.textMuted, fontSize: s(fontSizes.caption, scale) }}>
                {workout.workout_types?.label ?? 'Workout'}
              </p>
            </button>
          ))}
        </PopupWindow>
      )}
    </section>
  );
}