'use client';

import CalendarGrid from '@/components/ui/CalendarGrid';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';
import SectionDivider from '@/components/ui/SectionDivider';
import WorkoutPreview from '@/components/ui/WorkoutPreview';
import { s, useResponsive } from '@/lib/useResponsive';
import {
  getExercisesByWorkout,
  ReturnGetExercisesData,
} from '@/services/exercises';
import {
  getWorkoutMetrics,
  ReturnGetMetricsData,
} from '@/services/workoutMetrics';
import {
  getWorkouts,
  completeWorkout,
  ReturnGetWorkoutsData,
  CompleteWorkoutResult,
} from '@/services/workouts';
import { getUserData, ReturnGetUserData } from '@/services/userData';
import ExperienceSummaryPopUp from '@/components/ui/popups/ExperienceSummaryPopUp';
import { getWorkoutTypeGroup, WorkoutTypeGroup } from '@/services/workoutTypes';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { Mode } from '@/types/common';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

  const [workouts, setWorkouts] = useState<ReturnGetWorkoutsData[]>([]);
  const [selectedWorkout, setSelectedWorkout] =
    useState<ReturnGetWorkoutsData | null>(null);
  const [selectedWorkoutGroup, setSelectedWorkoutGroup] =
    useState<WorkoutTypeGroup | null>(null);
  const [exercises, setExercises] = useState<ReturnGetExercisesData[]>([]);
  const [metrics, setMetrics] = useState<ReturnGetMetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPreviewData, setIsLoadingPreviewData] = useState(false);
  const [showConfirmPopUp, setShowConfirmPopUp] = useState(false);
  const [userData, setUserData] = useState<ReturnGetUserData | null>(null);
  const [expResult, setExpResult] = useState<CompleteWorkoutResult | null>(
    null
  );

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 760 : 980;
  const selectedWorkoutFromParams = searchParams.get('workoutId');

  const workoutsByDay = useMemo(() => {
    return workouts.reduce<Record<string, ReturnGetWorkoutsData[]>>(
      (result, workout) => {
        const key = getWorkoutDateKey(workout.workout_date);
        result[key] = [...(result[key] ?? []), workout];
        return result;
      },
      {}
    );
  }, [workouts]);

  useEffect(() => {
    async function loadWorkouts() {
      setIsLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('User not authenticated.');
          return;
        }

        setUserData(await getUserData(user.id));
        setWorkouts(await getWorkouts({ userId: user.id }));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load workouts.');
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedWorkoutFromParams || workouts.length === 0 || selectedWorkout)
      return;
    const workout = workouts.find(
      (w) => String(w.id) === selectedWorkoutFromParams
    );
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
      previewRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);

    try {
      const group = (await getWorkoutTypeGroup(
        workout.workout_types.id
      )) as WorkoutTypeGroup;
      setSelectedWorkoutGroup(group);
      if (group === 'RepetitionBased') {
        const data = await getExercisesByWorkout(workout.id);
        setExercises(data as ReturnGetExercisesData[]);
      } else {
        const data = await getWorkoutMetrics(workout.id);
        setMetrics(data as ReturnGetMetricsData);
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
      workoutGroupType: selectedWorkoutGroup,
      workoutType: selectedWorkout.workout_types.label,
      name: selectedWorkout.name,
      mode: 'EDIT' as Mode,
    });

    const workoutDataView: Record<WorkoutTypeGroup, string> = {
      DistanceDuration: '/distance-duration',
      DurationOnly: '/distance-duration',
      RepetitionBased: '/repetition-based',
    };

    router.push(
      `add-workout-data${workoutDataView[selectedWorkoutGroup]}?${params.toString()}`
    );
  }

  async function handleConfirmWorkout() {
    if (!selectedWorkout) return;

    try {
      const result = await completeWorkout({ workoutId: selectedWorkout.id });
      setExpResult(result);
      setSelectedWorkout((prev) =>
        prev ? { ...prev, completed_at: new Date().toISOString() } : null
      );
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === selectedWorkout.id
            ? { ...w, completed_at: new Date().toISOString() }
            : w
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not confirm workout.');
    }
  }

  function onWorkoutPreviewClose() {
    setSelectedWorkout(null);
    setSelectedWorkoutGroup(null);
    setExercises([]);
    setMetrics(null);
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'transparent',
        padding: s(isMobile ? 18 : 24, scale),
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
      }}
    >
      <div style={{ width: '100%', maxWidth: contentMaxWidth }}>
        <header style={{ marginTop: s(isMobile ? 20 : 28, scale) }}>
          <h1
            style={{
              margin: 0,
              fontSize: s(
                isMobile ? fontSizes.heading1 : fontSizes.display,
                scale
              ),
              fontWeight: 700,
            }}
          >
            <SectionDivider label="Calendar" />
          </h1>
        </header>

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <CalendarGrid
          workoutsByDay={workoutsByDay}
          isLoading={isLoading}
          onSelectWorkout={openWorkout}
          onClosePreview={onWorkoutPreviewClose}
        />

        {selectedWorkout && (
          <WorkoutPreview
            workout={selectedWorkout}
            workoutGroup={selectedWorkoutGroup}
            exercises={exercises}
            metrics={metrics}
            isLoading={isLoadingPreviewData}
            onEdit={goToAddWorkoutData}
            onConfirm={() => setShowConfirmPopUp(true)}
            onClose={onWorkoutPreviewClose}
            previewRef={previewRef}
          />
        )}
      </div>

      {showConfirmPopUp && (
        <QuestionPopUp
          text="Are you sure you want to complete this workout? You won't be able to edit it once completed."
          onYes={() => {
            setShowConfirmPopUp(false);
            handleConfirmWorkout();
          }}
          onNo={() => setShowConfirmPopUp(false)}
        />
      )}

      {expResult && userData && selectedWorkoutGroup && (
        <ExperienceSummaryPopUp
          previousExp={userData.experience}
          result={expResult}
          workoutGroup={selectedWorkoutGroup}
          onClose={() => setExpResult(null)}
        />
      )}
    </main>
  );
}
