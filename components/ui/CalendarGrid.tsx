'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import PopupWindow from '@/components/ui/popups/PopUpWindow';
import { toDateKey } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { ReturnGetWorkoutsData } from '@/services/workouts';
import Button from './buttons/Button';
import BackButton from './buttons/BackButton';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const yearOptions = Array.from({ length: 21 }, (_, i) => 2010 + i);

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
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

type CalendarGridProps = {
  workoutsByDay: Record<string, ReturnGetWorkoutsData[]>;
  isLoading: boolean;
  onSelectWorkout: (workout: ReturnGetWorkoutsData) => void;
  onClosePreview: () => void;
};

export default function CalendarGrid({
  workoutsByDay,
  isLoading,
  onSelectWorkout,
  onClosePreview,
}: CalendarGridProps) {
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [popupDay, setPopupDay] = useState<string | null>(null);
  const [popupWorkouts, setPopupWorkouts] = useState<ReturnGetWorkoutsData[]>(
    []
  );

  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const monthLabel = visibleMonth.toLocaleDateString('en-US', {
    month: 'long',
  });
  const visibleYear = visibleMonth.getFullYear();

  function changeMonth(offset: number) {
    setVisibleMonth((c) => new Date(c.getFullYear(), c.getMonth() + offset, 1));
    onClosePreview();
  }

  function changeYear(year: number) {
    setVisibleMonth((c) => new Date(year, c.getMonth(), 1));
    setIsYearPickerOpen(false);
    onClosePreview();
  }

  return (
    <section className="calendar">
      <div className="calendar-nav">
        <BackButton label="Previous month" onClick={() => changeMonth(-1)} />
        <div className="calendar-nav-title">
          <button
            type="button"
            onClick={() => setIsYearPickerOpen((v) => !v)}
            className="calendar-year"
          >
            {visibleYear}
          </button>
          <h2 className="calendar-month">{monthLabel}</h2>
        </div>
        <BackButton
          label="Next month"
          direction="forward"
          onClick={() => changeMonth(1)}
          disabled={isLoading}
        />
      </div>

      {isYearPickerOpen ? (
        <div className="calendar-years">
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
        </div>
      ) : (
        <div className={cn('relative', isLoading && 'calendar-loading')}>
          {isLoading && (
            <div className="calendar-loading-spinner">
              <LoadingCircle />
            </div>
          )}

          <div className={cn('calendar-days', isLoading && 'opacity-30')}>
            {weekdays.map((weekday) => (
              <div key={weekday} className="calendar-weekday">
                {weekday}
              </div>
            ))}

            {monthDays.map((day, index) => {
              const key = day ? toDateKey(day) : `empty-${index}`;
              const dayWorkouts = day ? (workoutsByDay[key] ?? []) : [];
              const hasWorkouts = dayWorkouts.length > 0;

              return (
                <motion.button
                  key={key}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!hasWorkouts) {
                      onClosePreview();
                      return;
                    }
                    if (dayWorkouts.length === 1) {
                      onSelectWorkout(dayWorkouts[0]);
                    } else {
                      setPopupDay(key);
                      setPopupWorkouts(dayWorkouts);
                    }
                  }}
                  className={cn(
                    'calendar-day',
                    !day && 'calendar-day-empty',
                    hasWorkouts && 'calendar-day-active'
                  )}
                >
                  {day && <p>{day.getDate()}</p>}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {popupDay && (
        <PopupWindow
          title="Select workout for preview"
          onClose={() => setPopupDay(null)}
        >
          {popupWorkouts.map((workout) => (
            <Button
              onClick={() => {
                setPopupDay(null);
                onSelectWorkout(workout);
              }}
              width="3/4"
              key={workout.id}
            >
              {workout.name}
            </Button>
          ))}
        </PopupWindow>
      )}
    </section>
  );
}
