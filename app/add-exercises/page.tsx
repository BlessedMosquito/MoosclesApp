'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import LoadingCircle from '@/components/ui/LoadingCircle';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { s, useResponsive } from '@/lib/useResponsive';
import { addExercise, getExercisesByWorkout } from '@/services/exercises';
import { addSets, getSetsByExercise } from '@/services/sets';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type Exercise = {
  id: number | string;
  name: string;
};

type ExerciseSet = {
  id: number | string;
  reps: number;
  weight: number;
};

type SetDraft = {
  reps: string;
  weight: string;
};

export default function AddExercisesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const workoutId = searchParams.get('workoutId');
  const workoutName = searchParams.get('name') ?? 'Workout';
  const workoutType = searchParams.get('type') ?? 'workout';
  const from = searchParams.get('from');
  const calendarYear = searchParams.get('year');
  const calendarMonth = searchParams.get('month');

  const [exerciseName, setExerciseName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [setsByExercise, setSetsByExercise] = useState<Record<string, ExerciseSet[]>>({});
  const [setDrafts, setSetDrafts] = useState<Record<string, SetDraft>>({});
  const [loadingSetsByExercise, setLoadingSetsByExercise] = useState<Record<string, boolean>>({});

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  useEffect(() => {
    async function loadExercises() {
      if (!workoutId) {
        return;
      }

      setIsLoadingExercises(true);
      setError(null);

      try {
        const exerciseData = await getExercisesByWorkout(workoutId);
        setExercises(exerciseData as Exercise[]);
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
        setIsLoadingExercises(false);
      }
    }

    loadExercises();
  }, [workoutId]);

  function handleBack() {
    if (from === 'calendar') {
      const calendarParams = new URLSearchParams();

      if (calendarYear) {
        calendarParams.set('year', calendarYear);
      }

      if (calendarMonth) {
        calendarParams.set('month', calendarMonth);
      }

      if (workoutId) {
        calendarParams.set('workoutId', workoutId);
      }

      router.push(`/calendar?${calendarParams.toString()}`);
      return;
    }

    router.push('/add-workout');
  }

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

    setIsSaving(true);

    try {
      const exercise = await addExercise({
        workoutId,
        name: trimmedExerciseName,
        order: exercises.length + 1,
      });

      setExercises((currentExercises) => [
        ...currentExercises,
        exercise as Exercise,
      ]);
      setExerciseName('');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not add exercise.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleExercise(exercise: Exercise) {
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
        [exerciseId]: setData as ExerciseSet[],
      }));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load sets.'
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

  async function handleAddSet(exercise: Exercise) {
    const exerciseId = String(exercise.id);
    const draft = setDrafts[exerciseId] ?? { reps: '', weight: '' };
    const reps = Number(draft.reps);
    const weight = Number(draft.weight);

    if (!Number.isFinite(reps) || reps <= 0) {
      setError('Reps must be greater than 0.');
      return;
    }

    if (!Number.isFinite(weight) || weight < 0) {
      setError('Weight cannot be negative.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const existingSets = setsByExercise[exerciseId] ?? [];
      const newSet = await addSets({
        exerciseId: exercise.id,
        reps,
        weight,
        order: existingSets.length + 1,
      });

      setSetsByExercise((currentSets) => ({
        ...currentSets,
        [exerciseId]: [...existingSets, newSet as ExerciseSet],
      }));
      setSetDrafts((currentDrafts) => ({
        ...currentDrafts,
        [exerciseId]: { reps: '', weight: '' },
      }));
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Could not add set.'
      );
    } finally {
      setIsSaving(false);
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
        <BackButton onClick={handleBack} />

        <section
          style={{
            marginTop: s(28, scale),
          }}
        >
          <p
            style={{
              margin: 0,
              color: colors.textMuted,
              fontSize: s(fontSizes.caption, scale),
            }}
          >
            Step 2 of 2
          </p>

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
              fontSize: s(fontSizes.bodySmall, scale),
              lineHeight: 1.5,
            }}
          >
            Add exercises to your {workoutType} session.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            style={{
              marginTop: s(18, scale),
              padding: s(12, scale),
              borderRadius: s(12, scale),
              border: `1px solid ${colors.errorBorder}`,
              background: colors.errorSurface,
              color: colors.errorMuted,
              fontSize: s(fontSizes.bodySmall, scale),
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            marginTop: s(24, scale),
            display: 'flex',
            flexDirection: 'column',
            gap: s(16, scale),
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: s(10, scale),
            }}
          >
            <input
              placeholder="Exercise name"
              value={exerciseName}
              onChange={(event) => setExerciseName(event.target.value)}
              style={{
                minWidth: 0,
                flex: 1,
                padding: s(14, scale),
                borderRadius: s(14, scale),
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.text,
                fontSize: s(fontSizes.input, scale),
                outline: 'none',
              }}
            />

            <PrimaryButton
              onClick={handleAddExercise}
              disabled={isSaving}
              height={50}
            >
              Add
            </PrimaryButton>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: s(10, scale),
            }}
          >
            {isLoadingExercises ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: s(8, scale),
                }}
              >
                <LoadingCircle />
              </div>
            ) : exercises.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  color: colors.textMuted,
                  fontSize: s(fontSizes.bodySmall, scale),
                }}
              >
                No exercises added yet.
              </p>
            ) : (
              exercises.map((exercise, index) => {
                const exerciseId = String(exercise.id);
                const isExpanded = expandedExerciseId === exerciseId;
                const exerciseSets = setsByExercise[exerciseId] ?? [];
                const setDraft = setDrafts[exerciseId] ?? { reps: '', weight: '' };
                const isLoadingSets = loadingSetsByExercise[exerciseId];

                return (
                <div
                  key={exercise.id}
                  style={{
                    padding: s(14, scale),
                    borderRadius: s(14, scale),
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.text,
                    fontSize: s(fontSizes.bodySmall, scale),
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleExercise(exercise)}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      color: colors.text,
                      padding: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: s(12, scale),
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: s(fontSizes.bodySmall, scale),
                      fontWeight: 700,
                    }}
                  >
                    <span>
                      {index + 1}. {exercise.name}
                    </span>
                    <span>{isExpanded ? '-' : '+'}</span>
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: s(14, scale),
                        display: 'flex',
                        flexDirection: 'column',
                        gap: s(10, scale),
                      }}
                    >
                      {isLoadingSets ? (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: s(8, scale),
                          }}
                        >
                          <LoadingCircle size={18} />
                        </div>
                      ) : exerciseSets.length === 0 ? (
                        <p
                          style={{
                            margin: 0,
                            color: colors.textMuted,
                            fontSize: s(fontSizes.caption, scale),
                          }}
                        >
                          No sets yet.
                        </p>
                      ) : (
                        exerciseSets.map((setItem, setIndex) => (
                          <div
                            key={setItem.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'auto 1fr 1fr',
                              gap: s(10, scale),
                              alignItems: 'center',
                              padding: s(10, scale),
                              borderRadius: s(12, scale),
                              background: colors.glass,
                              border: `1px solid ${colors.border}`,
                            }}
                          >
                            <span style={{ color: colors.textMuted }}>
                              {setIndex + 1}
                            </span>
                            <span>{setItem.reps} reps</span>
                            <span>{setItem.weight} kg</span>
                          </div>
                        ))
                      )}

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr auto',
                          gap: s(8, scale),
                        }}
                      >
                        <input
                          inputMode="numeric"
                          placeholder="Reps"
                          value={setDraft.reps}
                          onChange={(event) =>
                            updateSetDraft(exerciseId, 'reps', event.target.value)
                          }
                          style={{
                            minWidth: 0,
                            padding: s(10, scale),
                            borderRadius: s(12, scale),
                            border: `1px solid ${colors.border}`,
                            background: colors.glass,
                            color: colors.text,
                            fontSize: s(fontSizes.bodySmall, scale),
                            outline: 'none',
                          }}
                        />
                        <input
                          inputMode="decimal"
                          placeholder="Weight in kg"
                          value={setDraft.weight}
                          onChange={(event) =>
                            updateSetDraft(exerciseId, 'weight', event.target.value)
                          }
                          style={{
                            minWidth: 0,
                            padding: s(10, scale),
                            borderRadius: s(12, scale),
                            border: `1px solid ${colors.border}`,
                            background: colors.glass,
                            color: colors.text,
                            fontSize: s(fontSizes.bodySmall, scale),
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSet(exercise)}
                          disabled={isSaving}
                          style={{
                            width: s(42, scale),
                            borderRadius: s(12, scale),
                            border: `1px solid ${colors.borderStrong}`,
                            background: colors.text,
                            color: colors.background,
                            fontSize: s(fontSizes.heading2, scale),
                            cursor: isSaving ? 'default' : 'pointer',
                            opacity: isSaving ? 0.7 : 1,
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
