'use client';

import { createElement, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { IconChevronRight } from '@tabler/icons-react';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import TextInput from '@/components/ui/inputs/TextInput';
import { getFormatedDate, parseDateKey } from '@/lib/helpers';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { getWorkoutTypeIcon } from '@/lib/workoutTypeIcon';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { getWorkouts, ReturnGetWorkoutsData } from '@/services/workouts';
import { Mode } from '@/types/common';
import { spring } from '@/lib/motion';

type WorkoutFilter = 'all' | 'strength' | 'cardio' | 'open' | 'done';

const FILTERS: { value: WorkoutFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
];

const workoutDataView: Record<WorkoutTypeGroup, string> = {
  DistanceDuration: '/distance-duration',
  DurationOnly: '/distance-duration',
  RepetitionBased: '/repetition-based',
};

function matchesFilter(workout: ReturnGetWorkoutsData, filter: WorkoutFilter) {
  const isStrength = workout.workout_types.workout_group === 'RepetitionBased';
  switch (filter) {
    case 'strength':
      return isStrength;
    case 'cardio':
      return !isStrength;
    case 'open':
      return !workout.completed_at;
    case 'done':
      return Boolean(workout.completed_at);
    default:
      return true;
  }
}

export default function WorkoutsTab() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<ReturnGetWorkoutsData[] | null>(
    null
  );
  const [filter, setFilter] = useState<WorkoutFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkouts() {
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser();

        if (!user) {
          if (!cancelled) setError('User not authenticated.');
          return;
        }

        const data = await getWorkouts({
          userId: user.id,
          name: debouncedSearch || undefined,
        });

        if (!cancelled) setWorkouts(data);
      } catch (loadError) {
        if (cancelled) return;
        setWorkouts([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load workouts.'
        );
      }
    }

    loadWorkouts();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  function openWorkout(workout: ReturnGetWorkoutsData) {
    const path =
      workoutDataView[workout.workout_types.workout_group as WorkoutTypeGroup];
    if (!path) return;

    const params = new URLSearchParams({
      workoutId: String(workout.id),
      mode: 'PREVIEW' as Mode,
    });

    router.push(`/add-workout-data${path}?${params.toString()}`);
  }

  const visible = workouts?.filter((workout) => matchesFilter(workout, filter));

  return (
    <div className="library-section">
      {error && <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>}

      <TextInput
        placeholder="Search workouts"
        value={search}
        onChange={setSearch}
      />

      <div className="library-filters">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              'chip shrink-0',
              item.value === filter && 'chip-active'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!visible ? (
        <div className="library-empty">
          <LoadingCircle />
        </div>
      ) : visible.length === 0 ? (
        <div className="library-empty">
          <p className="muted-text">
            {debouncedSearch
              ? `No workouts matching "${debouncedSearch}".`
              : 'No workouts here yet.'}
          </p>
        </div>
      ) : (
        <ul className="library-list">
          {visible.map((workout, index) => (
            <motion.li
              key={workout.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: Math.min(index, 10) * 0.03 }}
            >
              <button
                type="button"
                onClick={() => openWorkout(workout)}
                className="library-card pressable"
              >
                <span className="library-card-icon">
                  {createElement(
                    getWorkoutTypeIcon(
                      workout.workout_types.name,
                      workout.workout_types.workout_group
                    ),
                    { size: 20, stroke: 1.75 }
                  )}
                </span>
                <span className="library-card-text">
                  <span className="library-card-title">{workout.name}</span>
                  <span className="library-card-meta">
                    {workout.workout_types.name} ·{' '}
                    {getFormatedDate({
                      date: parseDateKey(workout.workout_date),
                      showYear: true,
                      nameMonth: true,
                    })}
                  </span>
                </span>
                <span
                  className={cn(
                    'library-badge',
                    workout.completed_at && 'library-badge-accent'
                  )}
                >
                  {workout.completed_at ? 'Done' : 'Open'}
                </span>
                <IconChevronRight
                  size={18}
                  stroke={2}
                  className="library-card-chevron"
                />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
