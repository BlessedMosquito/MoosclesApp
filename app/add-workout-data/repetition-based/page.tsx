'use client';

import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import ExerciseAccordion from '@/components/ui/ExerciseAccordion';
import { s, useResponsive } from '@/lib/useResponsive';
import {
  deleteExercise,
  getExercisesByWorkout,
  ReturnGetExercisesData,
} from '@/services/exercises';
import {
  addSets,
  deleteSet,
  getSetsByExercise,
  ReturnGetSetsData,
} from '@/services/sets';
import { getWorkoutById } from '@/services/workouts';
import { colors } from '@/theme/colors';
import { Mode } from '@/types/common';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import TopBar from '@/components/ui/topBar/TopBar';
import ChevronIcon from '@/components/icons/ChevronIcon';
import {
  EXERCISE_RETURN_PATH_KEY,
  PENDING_EXERCISE_WORKOUT_ID_KEY,
} from '@/app/constants/storageConstants';

type SetDraft = {
  reps: string;
  weight: string;
};

const decimalWeightPattern = /^\d+(?:[.,]\d{1,2})?$/;

export default function AddWorkoutDataRepetitionBased() {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const workoutId = searchParams.get('workoutId');
  const mode = searchParams.get('mode') as Mode;

  const [workoutName, setWorkoutName] = useState('Workout');
  const [workoutType, setWorkoutType] = useState('');
  const [exercises, setExercises] = useState<ReturnGetExercisesData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null
  );
  const [setsByExercise, setSetsByExercise] = useState<
    Record<string, ReturnGetSetsData[]>
  >({});
  const [setDrafts, setSetDrafts] = useState<Record<string, SetDraft>>({});
  const [loadingSetsByExercise, setLoadingSetsByExercise] = useState<
    Record<string, boolean>
  >({});
  const [showDeletePopUp, setShowDeletePopUp] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  const [setDeleteExerciseId, setSetDeleteExerciseId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  useEffect(() => {
    async function getWorkoutData() {
      if (!workoutId) return;

      const workout = await getWorkoutById(workoutId);
      if (workout) {
        setWorkoutName(workout.name);
        setWorkoutType(workout.workout_types.name?.toLowerCase() ?? '');
      }
    }
    getWorkoutData();
  }, [workoutId]);

  useEffect(() => {
    async function loadExercises() {
      if (!workoutId) return;
      setError(null);
      setIsLoading(true);
      try {
        const exerciseData = await getExercisesByWorkout(workoutId);
        setExercises(exerciseData as ReturnGetExercisesData[]);
        setExpandedExerciseId(null);
        setSetsByExercise({});
        setSetDrafts({});
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load exercises.'
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadExercises();
  }, [workoutId, refreshKey]);

  useEffect(() => {
    function handleReturn() {
      setRefreshKey((current) => current + 1);
    }
    window.addEventListener('popstate', handleReturn);
    return () => window.removeEventListener('popstate', handleReturn);
  }, []);

  async function handleOpenExercisePicker() {
    if (!workoutId) {
      setError('Missing workout id.');
      return;
    }

    setError(null);
    window.sessionStorage.setItem(PENDING_EXERCISE_WORKOUT_ID_KEY, workoutId);
    window.sessionStorage.setItem(
      EXERCISE_RETURN_PATH_KEY,
      `${pathname}?${searchParams.toString()}`
    );
    router.push('/add-workout-data/repetition-based/add-exercise');
  }

  function beforeDeletePopUp({
    exercise,
    setId,
    exerciseId,
  }: {
    exercise?: ReturnGetExercisesData;
    setId?: string | null;
    exerciseId?: string | null;
  }) {
    setShowDeletePopUp(true);
    setExerciseToDelete(exercise ? exercise.id : null);
    setSetToDelete(setId ?? null);
    setSetDeleteExerciseId(exerciseId ?? null);
  }

  async function handleDeleteExercise() {
    try {
      setError(null);
      if (!exerciseToDelete)
        throw new Error('No exercise selected for deletion.');

      setShowDeletePopUp(false);
      setIsLoading(true);

      await deleteExercise({ exerciseId: exerciseToDelete });

      setExercises((current) =>
        current.filter((exercise) => exercise.id !== exerciseToDelete)
      );

      if (expandedExerciseId === String(exerciseToDelete)) {
        setExpandedExerciseId(null);
      }

      setExerciseToDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete exercise.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteSet() {
    if (!setToDelete || !setDeleteExerciseId) return;

    try {
      setError(null);
      setShowDeletePopUp(false);
      setIsLoading(true);
      await deleteSet(setToDelete);
      setSetsByExercise((c) => ({
        ...c,
        [setDeleteExerciseId]: (c[setDeleteExerciseId] ?? []).filter(
          (s) => s.id !== setToDelete
        ),
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete set.');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleExercise(exercise: ReturnGetExercisesData) {
    const exerciseId = String(exercise.id);

    if (expandedExerciseId === exerciseId) {
      setExpandedExerciseId(null);
      return;
    }

    setExpandedExerciseId(exerciseId);
    setSetDrafts((c) => ({
      ...c,
      [exerciseId]: c[exerciseId] ?? { reps: '', weight: '' },
    }));

    if (setsByExercise[exerciseId]) return;

    setLoadingSetsByExercise((c) => ({ ...c, [exerciseId]: true }));
    setError(null);

    try {
      const setData = await getSetsByExercise(exercise.id);
      setSetsByExercise((c) => ({
        ...c,
        [exerciseId]: setData as ReturnGetSetsData[],
      }));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Could not load sets.'
      );
    } finally {
      setLoadingSetsByExercise((c) => ({ ...c, [exerciseId]: false }));
    }
  }

  function updateSetDraft(
    exerciseId: string,
    field: keyof SetDraft,
    value: string
  ) {
    setSetDrafts((c) => ({
      ...c,
      [exerciseId]: {
        ...(c[exerciseId] ?? { reps: '', weight: '' }),
        [field]: value,
      },
    }));
  }

  async function handleAddSet(exercise: ReturnGetExercisesData) {
    const exerciseId = String(exercise.id);
    const draft = setDrafts[exerciseId] ?? { reps: '', weight: '' };
    const reps = Number(draft.reps);
    const normalizedWeight = draft.weight.replace(',', '.');
    const weight = draft.weight.trim() === '' ? 0 : Number(normalizedWeight);

    if (!Number.isFinite(reps) || reps <= 0) {
      setError('Reps must be greater than 0.');
      return;
    }
    if (
      draft.weight.trim() !== '' &&
      (!decimalWeightPattern.test(draft.weight) || !Number.isFinite(weight))
    ) {
      setError('Weight must have up to 2 decimal places.');
      return;
    }
    if (weight < 0) {
      setError('Weight cannot be negative.');
      return;
    }

    setError(null);

    try {
      const existingSets = setsByExercise[exerciseId] ?? [];
      const newSet = await addSets({
        exerciseId: exercise.id,
        reps,
        weight: Math.round(weight * 100) / 100,
        order: existingSets.length + 1,
      });
      setSetsByExercise((c) => ({
        ...c,
        [exerciseId]: [...existingSets, newSet as ReturnGetSetsData],
      }));
      setSetDrafts((c) => ({ ...c, [exerciseId]: { reps: '', weight: '' } }));
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Could not add set.'
      );
    }
  }

  return (
    <main
      style={{
        background: 'transparent',
        padding: s(isMobile ? 18 : 28, scale),
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: contentMaxWidth }}>
        <TopBar
          left={
            <button
              style={{
                rotate: '-180deg',
                cursor: 'pointer',
              }}
              onClick={() =>
                mode === 'PREVIEW' ? router.back() : router.push('/calendar')
              }
            >
              <ChevronIcon />
            </button>
          }
          center={workoutName}
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <p
          style={{
            margin: `${s(32, scale)}px 0`,
            color: colors.text,
            fontSize: s(isMobile ? 20 : 32, scale),
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          {mode === 'PREVIEW'
            ? ''
            : `Add exercises to your ${workoutType} session`}
        </p>

        <section
          style={{
            marginTop: s(24, scale),
            display: 'flex',
            flexDirection: 'column',
            gap: s(16, scale),
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: s(120, scale),
              }}
            >
              <LoadingCircle />
            </div>
          ) : (
            <>
              {exercises.map((exercise, index) => {
                const exerciseId = String(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: s(8, scale),
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <ExerciseAccordion
                        exercise={exercise}
                        index={index}
                        isExpanded={expandedExerciseId === exerciseId}
                        exerciseSets={setsByExercise[exerciseId] ?? []}
                        setDraft={
                          setDrafts[exerciseId] ?? { reps: '', weight: '' }
                        }
                        mode={mode}
                        isLoadingSets={loadingSetsByExercise[exerciseId]}
                        onToggle={toggleExercise}
                        onDraftChange={updateSetDraft}
                        onAddSet={handleAddSet}
                        onDeleteExercise={() => beforeDeletePopUp({ exercise })}
                        showDeletePopUp={(setId, exerciseId) =>
                          beforeDeletePopUp({ setId, exerciseId })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </section>

        {!isLoading && mode !== 'PREVIEW' && (
          <div style={{ marginTop: s(16, scale) }}>
            <Button onClick={handleOpenExercisePicker} width="full">
              + Add exercise
            </Button>
          </div>
        )}
      </div>

      {showDeletePopUp && (
        <QuestionPopUp
          text={
            setToDelete
              ? 'Do you really want to delete selected set?'
              : 'Do you really want to delete selected exercise?'
          }
          onYes={setToDelete ? handleDeleteSet : handleDeleteExercise}
          onNo={() => setShowDeletePopUp(false)}
        />
      )}
    </main>
  );
}
