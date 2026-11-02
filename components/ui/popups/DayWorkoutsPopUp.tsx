'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { IconChevronRight, IconX } from '@tabler/icons-react';
import { getWorkoutTypeIcon } from '@/lib/workoutTypeIcon';
import { cn } from '@/lib/utils';
import { ReturnGetWorkoutsData } from '@/services/workouts';

type DayWorkoutsPopUpProps = {
  dateKey: string;
  workouts: ReturnGetWorkoutsData[];
  onSelect: (workout: ReturnGetWorkoutsData) => void;
  onClose: () => void;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function formatDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function DayWorkoutsPopUp({
  dateKey,
  workouts,
  onSelect,
  onClose,
}: DayWorkoutsPopUpProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClose}
      className="overlay overlay-strong"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-workouts-title"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        onClick={(event) => event.stopPropagation()}
        className="day-workouts"
      >
        <div className="day-workouts-header">
          <div>
            <p id="day-workouts-title" className="day-workouts-title">
              {formatDateKey(dateKey)}
            </p>
            <p className="day-workouts-subtitle">
              {workouts.length} workouts · choose one to preview
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="day-workouts-close"
          >
            <IconX size={18} stroke={2.25} />
          </button>
        </div>

        <ul className="day-workouts-list">
          {workouts.map((workout, index) => {
            const Icon = getWorkoutTypeIcon(
              workout.workout_types.name,
              workout.workout_types.workout_group
            );
            const isCompleted = Boolean(workout.completed_at);

            return (
              <motion.li
                key={workout.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.28,
                  ease: EASE_OUT,
                  delay: 0.06 + index * 0.04,
                }}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(workout)}
                  className="day-workout"
                >
                  <span className="day-workout-icon">
                    <Icon size={20} stroke={2} />
                  </span>
                  <span className="day-workout-text">
                    <span className="day-workout-name">{workout.name}</span>
                    <span className="day-workout-meta">
                      {workout.workout_types.name}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'day-workout-status',
                      isCompleted && 'day-workout-status-done'
                    )}
                  >
                    {isCompleted ? 'Done' : 'Open'}
                  </span>
                  <IconChevronRight
                    size={18}
                    stroke={2}
                    className="day-workout-chevron"
                  />
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
}
