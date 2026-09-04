'use client';

import Button from '@/components/ui/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import ExerciseAccordion from '@/components/ui/ExerciseAccordion';
import SectionDivider from '@/components/ui/SectionDivider';
import { s, useResponsive } from '@/lib/useResponsive';
import {
  addExercise,
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
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { Mode } from '@/types/common';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';

type SetDraft = {
  reps: string;
  weight: string;
};

const decimalWeightPattern = /^\d+(?:[.,]\d{1,2})?$/;

export default function AddWorkoutDataRepetitionBased() {
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const workoutId = searchParams.get('workoutId');
  const workoutName = searchParams.get('name') ?? 'Workout';
  const workoutType = searchParams.get('workoutType')?.toLowerCase();
  const mode = searchParams.get('mode') as Mode;

  const [exerciseName, setExerciseName] = useState('');
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
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [showDeletePopUp, setShowDeletePopUp] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  const [setDeleteExerciseId, setSetDeleteExerciseId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

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
  }, [workoutId]);

  useEffect(() => {
    if (isAddingExercise) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isAddingExercise]);

  async function handleAddExercise() {
    setError(null);
    const trimmedExerciseName = exerciseName.trim();

    if (!workoutId) {
      setError('Missing workout id.');
      return;
    }
    if (!trimmedExerciseName) {
      setError('Exercise name is required.');
      return;
    }

    try {
      const exercise = await addExercise({
        workoutId,
        name: trimmedExerciseName,
        order: exercises.length + 1,
      });
      const newExercise = exercise as ReturnGetExercisesData;
      setExercises((c) => [...c, newExercise]);
      setExpandedExerciseId(String(newExercise.id));
      setExerciseName('');
      setIsAddingExercise(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not add exercise.'
      );
    }
  }

  function handleCancelAdd() {
    setExerciseName('');
    setIsAddingExercise(false);
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
    const weight = Number(normalizedWeight);

    if (!Number.isFinite(reps) || reps <= 0) {
      setError('Reps must be greater than 0.');
      return;
    }
    if (!decimalWeightPattern.test(draft.weight) || !Number.isFinite(weight)) {
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
        minHeight: '100dvh',
        background: 'transparent',
        padding: s(isMobile ? 18 : 28, scale),
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: contentMaxWidth }}>
        <section style={{ marginTop: s(28, scale) }}>
          <h1
            style={{
              margin: `${s(8, scale)}px 0 0`,
              fontSize: s(
                isMobile ? fontSizes.heading1 : fontSizes.display,
                scale
              ),
              fontWeight: 700,
            }}
          >
            {workoutName}
          </h1>
          <p
            style={{
              margin: `${s(10, scale)}px 0 0`,
              color: colors.text,
              fontSize: s(fontSizes.body, scale),
              lineHeight: 1.5,
            }}
          >
            Add exercises to your {workoutType} session.
          </p>
        </section>

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <SectionDivider label="Exercise list" />

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
                        onDeleteExercise={() =>
                          beforeDeletePopUp({ exercise })
                        }
                        showDeletePopUp={(setId, exerciseId) =>
                          beforeDeletePopUp({ setId, exerciseId })
                        }
                      />
                    </div>
                  </div>
                );
              })}

              {isAddingExercise && (
                <div
                  style={{
                    padding: s(14, scale),
                    borderRadius: s(14, scale),
                    border: `1px solid ${colors.border}`,
                    background: colors.componentsBg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: s(10, scale),
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: s(fontSizes.caption, scale),
                      color: colors.text,
                      fontWeight: 600,
                    }}
                  >
                    Exercise {exercises.length + 1}
                  </p>
                  <input
                    ref={inputRef}
                    placeholder="Exercise name"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddExercise();
                      if (e.key === 'Escape') handleCancelAdd();
                    }}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: s(12, scale),
                      borderRadius: s(12, scale),
                      border: `1px solid ${colors.border}`,
                      background: colors.componentsBg,
                      color: colors.text,
                      fontSize: Math.max(s(fontSizes.input, scale), 16),
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: s(8, scale) }}>
                    <Button onClick={handleAddExercise} width="full">
                      Add
                    </Button>
                    <Button onClick={handleCancelAdd} width="full">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {!isLoading && !isAddingExercise && (
          <div style={{ marginTop: s(16, scale) }}>
            <Button onClick={() => setIsAddingExercise(true)} width="full">
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
