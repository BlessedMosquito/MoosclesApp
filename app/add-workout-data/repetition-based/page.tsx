'use client';

import ErrorPopUp from '@/components/ui/ErrorPopUp';
import ExerciseAccordion from '@/components/ui/ExerciseAccordion';
import SectionDivider from '@/components/ui/SectionDivider';
import { s, useResponsive } from '@/lib/useResponsive';
import {
  addExercise,
  getExercisesByWorkout,
  ReturnGetExercisesData,
} from '@/services/exercises';
import { addSets, getSetsByExercise, ReturnGetSetsData } from '@/services/sets';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type SetDraft = {
  reps: string;
  weight: string;
};

const decimalWeightPattern = /^\d+(?:[.,]\d{1,2})?$/;

export default function AddWorkoutDataRepetitionBased() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const workoutId = searchParams.get('workoutId');
  const workoutName = searchParams.get('name') ?? 'Workout';
  const workoutType = searchParams.get('workoutType')?.toLowerCase();
  const from = searchParams.get('from');
  const calendarYear = searchParams.get('year');
  const calendarMonth = searchParams.get('month');

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

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  useEffect(() => {
    async function loadExercises() {
      if (!workoutId) {
        return;
      }
      setError(null);

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
      }
    }

    loadExercises();
  }, [workoutId]);

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

      setExercises((currentExercises) => [
        ...currentExercises,
        exercise as ReturnGetExercisesData,
      ]);
      setExerciseName('');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not add exercise.'
      );
    }
  }

  async function toggleExercise(exercise: ReturnGetExercisesData) {
    const exerciseId = String(exercise.id);

    if (expandedExerciseId === exerciseId) {
      setExpandedExerciseId(null);
      return;
    }

    setExpandedExerciseId(exerciseId);
    setSetDrafts((currentDrafts) => ({
      ...currentDrafts,
      [exerciseId]: currentDrafts[exerciseId] ?? { reps: '', weight: '' },
    }));

    if (setsByExercise[exerciseId]) {
      return;
    }

    setLoadingSetsByExercise((currentLoading) => ({
      ...currentLoading,
      [exerciseId]: true,
    }));
    setError(null);

    try {
      const setData = await getSetsByExercise(exercise.id);
      setSetsByExercise((currentSets) => ({
        ...currentSets,
        [exerciseId]: setData as ReturnGetSetsData[],
      }));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Could not load sets.'
      );
    } finally {
      setLoadingSetsByExercise((currentLoading) => ({
        ...currentLoading,
        [exerciseId]: false,
      }));
    }
  }

  function updateSetDraft(
    exerciseId: string,
    field: keyof SetDraft,
    value: string
  ) {
    setSetDrafts((currentDrafts) => ({
      ...currentDrafts,
      [exerciseId]: {
        ...(currentDrafts[exerciseId] ?? { reps: '', weight: '' }),
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

      setSetsByExercise((currentSets) => ({
        ...currentSets,
        [exerciseId]: [...existingSets, newSet as ReturnGetSetsData],
      }));
      setSetDrafts((currentDrafts) => ({
        ...currentDrafts,
        [exerciseId]: { reps: '', weight: '' },
      }));
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
        background: colors.background,
        padding: s(isMobile ? 18 : 28, scale),
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: contentMaxWidth,
        }}
      >
        <section
          style={{
            marginTop: s(28, scale),
          }}
        >
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
              color: colors.textSecondary,
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
          {exercises.map((exercise, index) => {
            const exerciseId = String(exercise.id);
            return (
              <ExerciseAccordion
                key={exercise.id}
                exercise={exercise}
                index={index}
                isExpanded={expandedExerciseId === exerciseId}
                exerciseSets={setsByExercise[exerciseId] ?? []}
                setDraft={
                  setDrafts[exerciseId] ?? {
                    reps: '',
                    weight: '',
                  }
                }
                isLoadingSets={loadingSetsByExercise[exerciseId]}
                onToggle={toggleExercise}
                onDraftChange={updateSetDraft}
                onAddSet={handleAddSet}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
}
