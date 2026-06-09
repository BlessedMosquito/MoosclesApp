'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';
import CalendarGrid from '@/components/ui/CalendarGrid';
import WorkoutPreview from '@/components/ui/WorkoutPreview';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { getExercisesByWorkout, ReturnGetExercisesData } from '@/services/exercises';
import { getWorkouts, ReturnGetWorkoutsData } from '@/services/workouts';
import { getWorkoutTypeGroup, WorkoutTypeGroup } from '@/services/workoutTypes';
import { getWorkoutMetrics, ReturnGetMetricsData } from '@/services/workoutMetrics';

function getWorkoutDateKey(workoutDate: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(workoutDate)) return workoutDate;
  const d = new Date(workoutDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();
  const previewRef = useRef<HTMLElement>(null);

  const [workouts, setWorkouts] = useState<ReturnGetWorkoutsData[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<ReturnGetWorkoutsData | null>(null);
  const [selectedWorkoutGroup, setSelectedWorkoutGroup] = useState<WorkoutTypeGroup | null>(null);
  const [exercises, setExercises] = useState<ReturnGetExercisesData[]>([]);
  const [metrics, setMetrics] = useState<ReturnGetMetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPreviewData, setIsLoadingPreviewData] = useState(false);

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 760 : 980;
  const selectedWorkoutFromParams = searchParams.get('workoutId');

  const workoutsByDay = useMemo(() => {
    return workouts.reduce<Record<string, ReturnGetWorkoutsData[]>>((result, workout) => {
      const key = getWorkoutDateKey(workout.workout_date);
      result[key] = [...(result[key] ?? []), workout];
      return result;
    }, {});
  }, [workouts]);

  useEffect(() => {
    async function loadWorkouts() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWorkouts();
        setWorkouts(data as ReturnGetWorkoutsData[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load workouts.');
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkouts();
  }, []);

  useEffect(() => {
    if (!selectedWorkoutFromParams || workouts.length === 0 || selectedWorkout) return;
    const workout = workouts.find(w => String(w.id) === selectedWorkoutFromParams);
    if (workout) openWorkout(workout);
  }, [selectedWorkoutFromParams, workouts, selectedWorkout]);

  async function openWorkout(workout: ReturnGetWorkoutsData) {
    setSelectedWorkout(workout);
    setSelectedWorkoutGroup(null);
    setExercises([]);
    setMetrics(null);
    setIsLoadingPreviewData(true);
    setError(null);

    window.setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    try {
      const group = await getWorkoutTypeGroup(workout.workout_types.id) as WorkoutTypeGroup;
      setSelectedWorkoutGroup(group);
      if (group === 'RepetitionBased') {
        const data = await getExercisesByWorkout(workout.id);
        setExercises(data as ReturnGetExercisesData[]);
      } else {
        const data = await getWorkoutMetrics(String(workout.id));
        setMetrics(data[0] ?? null);
      }
    } catch {
      setError('Failed to load workout data.');
    } finally {
      setIsLoadingPreviewData(false);
    }
  }

  async function goToAddWorkoutData() {
    if (!selectedWorkout || !selectedWorkoutGroup) return;

    const params = new URLSearchParams({
      workoutId: String(selectedWorkout.id),
      name: selectedWorkout.name,
      type: selectedWorkout.workout_types?.label ?? 'workout',
      from: 'calendar',
    });

    const workoutDataView: Record<WorkoutTypeGroup, string> = {
      'DistanceDuration': '/distance-duration',
      'DurationOnly': '/distance-duration',
      'RepetitionBased': '/repetition-based',
    };

    router.push(`add-workout-data${workoutDataView[selectedWorkoutGroup]}?${params.toString()}`);
  }

  function onWorkoutPreviewClose(){
    setSelectedWorkout(null);
    setSelectedWorkoutGroup(null);
    setExercises([]);
    setMetrics(null);
  }

  return (
    <main style={{
      minHeight: '100dvh',
      background: colors.background,
      padding: s(isMobile ? 18 : 24, scale),
      color: colors.text,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: contentMaxWidth }}>
        <BackButton onClick={() => router.push('/dashboard')} />

        <header style={{ marginTop: s(isMobile ? 20 : 28, scale) }}>
          <h1 style={{ margin: 0, fontSize: s(isMobile ? fontSizes.heading1 : fontSizes.display, scale), fontWeight: 700 }}>
            Calendar
          </h1>
          <p style={{ margin: `${s(8, scale)}px 0 0`, color: colors.textSecondary, fontSize: s(fontSizes.bodySmall, scale) }}>
            Tap a workout to preview details.
          </p>
        </header>

        {error && (
          <div role="alert" style={{
            marginTop: s(18, scale),
            padding: s(12, scale),
            borderRadius: s(12, scale),
            border: `1px solid ${colors.errorBorder}`,
            background: colors.errorSurface,
            color: colors.errorMuted,
            fontSize: s(fontSizes.bodySmall, scale),
          }}>
            {error}
          </div>
        )}

        <CalendarGrid
          workoutsByDay={workoutsByDay}
          selectedWorkout={selectedWorkout}
          isLoading={isLoading}
          onSelectWorkout={openWorkout}
        />

        {selectedWorkout && (
          <WorkoutPreview
            workout={selectedWorkout}
            workoutGroup={selectedWorkoutGroup}
            exercises={exercises}
            metrics={metrics}
            isLoading={isLoadingPreviewData}
            onEdit={goToAddWorkoutData}
            onClose={onWorkoutPreviewClose}
            previewRef={previewRef}
          />
        )}
      </div>
    </main>
  );
}