'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { IconChevronDown } from '@tabler/icons-react';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import DayWorkoutsPopUp from '@/components/ui/popups/DayWorkoutsPopUp';
import { toDateKey } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { ReturnGetWorkoutsData } from '@/services/workouts';
import BackButton from './buttons/BackButton';
import { spring } from '@/lib/motion';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const yearOptions = Array.from({ length: 21 }, (_, i) => 2010 + i);
const MAX_DOTS = 3;

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const days: Array<Date | null> = [];
  for (let i = 0; i < leadingDays; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++)
    days.push(new Date(year, month, d));
  while (days.length < 42) days.push(null);
  return days;
}

type CalendarGridProps = {
  workoutsByDay: Record<string, ReturnGetWorkoutsData[]>;
  isLoading: boolean;
  selectedDateKey?: string | null;
  onSelectWorkout: (workout: ReturnGetWorkoutsData) => void;
  onClosePreview: () => void;
};

export default function CalendarGrid({
  workoutsByDay,
  isLoading,
  selectedDateKey,
  onSelectWorkout,
  onClosePreview,
}: CalendarGridProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [popupDay, setPopupDay] = useState<string | null>(null);
  const [popupWorkouts, setPopupWorkouts] = useState<ReturnGetWorkoutsData[]>(
    []
  );

  const todayKey = toDateKey(new Date());
  const monthDays = getMonthDays(visibleMonth);
  const monthLabel = visibleMonth.toLocaleDateString('en-US', {
    month: 'long',
  });
  const visibleYear = visibleMonth.getFullYear();
  const isCurrentMonth = todayKey.startsWith(
    toDateKey(visibleMonth).slice(0, 7)
  );

  const monthStats = { total: 0, completed: 0, activeDays: 0 };
  for (const day of monthDays) {
    if (!day) continue;
    const dayWorkouts = workoutsByDay[toDateKey(day)] ?? [];
    if (dayWorkouts.length > 0) monthStats.activeDays += 1;
    monthStats.total += dayWorkouts.length;
    monthStats.completed += dayWorkouts.filter((w) => w.completed_at).length;
  }

  function showMonth(next: Date) {
    setVisibleMonth(next);
    onClosePreview();
  }

  function changeMonth(offset: number) {
    showMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    );
  }

  function changeYear(year: number) {
    showMonth(new Date(year, visibleMonth.getMonth(), 1));
    setIsYearPickerOpen(false);
  }

  function goToToday() {
    const now = new Date();
    showMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setIsYearPickerOpen(false);
  }

  function handleDayClick(key: string, dayWorkouts: ReturnGetWorkoutsData[]) {
    if (dayWorkouts.length === 0) {
      onClosePreview();
      return;
    }
    if (dayWorkouts.length === 1) {
      onSelectWorkout(dayWorkouts[0]);
      return;
    }
    setPopupDay(key);
    setPopupWorkouts(dayWorkouts);
  }

  return (
    <section className="calendar">
      <div className="calendar-header">
        <div className="calendar-heading">
          <h1 className="calendar-month">{monthLabel}</h1>
          <button
            type="button"
            aria-expanded={isYearPickerOpen}
            onClick={() => setIsYearPickerOpen((v) => !v)}
            className="calendar-year"
          >
            {visibleYear}
            <IconChevronDown
              size={16}
              stroke={2.25}
              className={cn(
                'transition-transform',
                isYearPickerOpen && 'rotate-180'
              )}
            />
          </button>
        </div>

        <div className="calendar-controls">
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={goToToday}
              className="calendar-today-btn"
            >
              Today
            </button>
          )}
          <BackButton label="Previous month" onClick={() => changeMonth(-1)} />
          <BackButton
            label="Next month"
            direction="forward"
            onClick={() => changeMonth(1)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="calendar-stats">
        <span className="calendar-stat">
          <strong>{monthStats.total}</strong> workouts
        </span>
        <span className="calendar-stat">
          <strong>{monthStats.completed}</strong> completed
        </span>
        <span className="calendar-stat">
          <strong>{monthStats.activeDays}</strong> active days
        </span>
      </div>

      {isYearPickerOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="calendar-years"
        >
          {yearOptions.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => changeYear(year)}
              className={cn(
                'calendar-year-option',
                year === visibleYear && 'calendar-year-option-active'
              )}
            >
              {year}
            </button>
          ))}
        </motion.div>
      ) : (
        <div className="calendar-board">
          <div className="calendar-weekdays">
            {weekdays.map((weekday) => (
              <div key={weekday} className="calendar-weekday">
                {weekday}
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden">
            {isLoading && (
              <div className="calendar-loading-spinner">
                <LoadingCircle />
              </div>
            )}
            <div className={cn('calendar-days', isLoading && 'opacity-30')}>
              {monthDays.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="calendar-day calendar-day-empty"
                    />
                  );
                }

                const key = toDateKey(day);
                const dayWorkouts = workoutsByDay[key] ?? [];
                const hasWorkouts = dayWorkouts.length > 0;
                const allCompleted =
                  hasWorkouts && dayWorkouts.every((w) => w.completed_at);

                return (
                  <motion.button
                    key={key}
                    type="button"
                    whileTap={hasWorkouts ? { scale: 0.92 } : undefined}
                    onClick={() => handleDayClick(key, dayWorkouts)}
                    aria-label={`${day.toDateString()}, ${dayWorkouts.length} workouts`}
                    className={cn(
                      'calendar-day',
                      hasWorkouts && 'calendar-day-active',
                      allCompleted && 'calendar-day-done',
                      key === todayKey && 'calendar-day-today',
                      key === selectedDateKey && 'calendar-day-selected'
                    )}
                  >
                    <span className="calendar-day-number">{day.getDate()}</span>

                    {hasWorkouts && (
                      <>
                        <span className="calendar-day-names">
                          {dayWorkouts.slice(0, 2).map((workout) => (
                            <span
                              key={workout.id}
                              className="calendar-day-name"
                            >
                              {workout.name}
                            </span>
                          ))}
                          {dayWorkouts.length > 2 && (
                            <span className="calendar-day-more">
                              +{dayWorkouts.length - 2} more
                            </span>
                          )}
                        </span>

                        <span className="calendar-day-dots">
                          {dayWorkouts.slice(0, MAX_DOTS).map((workout) => (
                            <span
                              key={workout.id}
                              className={cn(
                                'calendar-dot',
                                workout.completed_at && 'calendar-dot-done'
                              )}
                            />
                          ))}
                        </span>
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="calendar-legend">
            <span className="calendar-legend-item">
              <span className="calendar-dot calendar-dot-done" />
              Completed
            </span>
            <span className="calendar-legend-item">
              <span className="calendar-dot" />
              In progress
            </span>
          </div>
        </div>
      )}

      {popupDay && (
        <DayWorkoutsPopUp
          dateKey={popupDay}
          workouts={popupWorkouts}
          onClose={() => setPopupDay(null)}
          onSelect={(workout) => {
            setPopupDay(null);
            onSelectWorkout(workout);
          }}
        />
      )}
    </section>
  );
}
