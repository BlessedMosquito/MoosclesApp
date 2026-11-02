'use client';

import Button from '@/components/ui/buttons/Button';
import SaveIcon from '@/components/icons/SaveIcon';
import { IconPlus } from '@tabler/icons-react';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import ExerciseAccordion from '@/components/ui/ExerciseAccordion';
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
import { deleteWorkout, getWorkoutById } from '@/services/workouts';
import { Mode } from '@/types/common';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import TopBar from '@/components/ui/topBar/TopBar';
import BackButton from '@/components/ui/buttons/BackButton';
import CompletedSection from '@/components/ui/CompletedSection';
import {
  EXERCISE_RETURN_PATH_KEY,
  PENDING_EXERCISE_TEMPLATE_ID_KEY,
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

  const workoutId = searchParams.get('workoutId');
  const mode = searchParams.get('mode') as Mode;
  const isPreview = mode === 'PREVIEW';
  const isEditing = isPreview && searchParams.get('edit') === '1';

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
  const [isCompleted, setIsCompleted] = useState(false);
  const [showDeleteWorkoutPopUp, setShowDeleteWorkoutPopUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isReadOnly = (isPreview && !isEditing) || isCompleted;

  useEffect(() => {
    async function getWorkoutData() {
      if (!workoutId) return;

      const workout = await getWorkoutById(workoutId);
      if (workout) {
        setWorkoutName(workout.name);
        setWorkoutType(workout.workout_types.name?.toLowerCase() ?? '');
        setIsCompleted(workout.completed_at !== null);
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
    if (isReadOnly) return;

    if (!workoutId) {
      setError('Missing workout id.');
      return;
    }

    setError(null);
    window.sessionStorage.removeItem(PENDING_EXERCISE_TEMPLATE_ID_KEY);
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
    if (isReadOnly) return;

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
    if (isReadOnly || !setToDelete || !setDeleteExerciseId) return;

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
    if (isReadOnly) return;

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
        order:
          existingSets.reduce(
            (max, setItem) => Math.max(max, setItem.set_order),
            0
          ) + 1,
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

  function setEditing(editing: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (editing) {
      params.set('edit', '1');
    } else {
      params.delete('edit');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  async function handleDeleteWorkout() {
    if (!workoutId || isCompleted) return;

    setShowDeleteWorkoutPopUp(false);
    setIsDeleting(true);
    setError(null);

    try {
      await deleteWorkout(workoutId);
      if (window.history.length > 1) {
        router.back();
      } else {
        router.replace('/library');
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete workout.'
      );
      setIsDeleting(false);
    }
  }

  return (
    <main className="page-section">
      <div className="page-content page-content-narrow">
        <TopBar
          left={<BackButton onClick={() => router.push('/library')} />}
          center={workoutName}
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <header className="workout-data-header">
          <h2 className="workout-data-heading">Exercises</h2>
          {!isLoading && (
            <p className="workout-data-subheading">
              {[
                workoutType,
                `${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </header>

        <section className="exercise-list">
          {isLoading ? (
            <div className="exercise-list-loading">
              <LoadingCircle />
            </div>
          ) : (
            exercises.map((exercise, index) => {
              const exerciseId = String(exercise.id);
              return (
                <ExerciseAccordion
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  isExpanded={expandedExerciseId === exerciseId}
                  exerciseSets={setsByExercise[exerciseId] ?? []}
                  setDraft={setDrafts[exerciseId] ?? { reps: '', weight: '' }}
                  mode={isReadOnly ? 'PREVIEW' : isEditing ? 'EDIT' : mode}
                  isLoadingSets={loadingSetsByExercise[exerciseId]}
                  onToggle={toggleExercise}
                  onDraftChange={updateSetDraft}
                  onAddSet={handleAddSet}
                  onDeleteExercise={() => beforeDeletePopUp({ exercise })}
                  showDeletePopUp={(setId, exerciseId) =>
                    beforeDeletePopUp({ setId, exerciseId })
                  }
                />
              );
            })
          )}
        </section>

        {!isLoading && isCompleted && (
          <div className="mt-4 flex">
            <CompletedSection />
          </div>
        )}

        {!isLoading && !isReadOnly && (
          <div className="mt-4">
            <Button
              onClick={handleOpenExercisePicker}
              width="full"
              variant="secondary"
            >
              <IconPlus size={18} stroke={2.25} />
              Add exercise
            </Button>
          </div>
        )}

        {!isLoading && isPreview && !isCompleted && (
          <div className="workout-data-buttons mt-4">
            {isEditing ? (
              <Button onClick={() => setEditing(false)} width="full">
                <SaveIcon />
                Save
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setEditing(true)}
                  disabled={isDeleting}
                  width="full"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteWorkoutPopUp(true)}
                  disabled={isDeleting}
                  width="full"
                  variant="danger"
                >
                  {isDeleting ? <LoadingCircle size={18} /> : 'Delete'}
                </Button>
              </>
            )}
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

      {showDeleteWorkoutPopUp && (
        <QuestionPopUp
          text="Do you really want to delete this workout?"
          onYes={handleDeleteWorkout}
          onNo={() => setShowDeleteWorkoutPopUp(false)}
        />
      )}
    </main>
  );
}
