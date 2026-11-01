'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import Grid, { GridColumn } from '@/components/ui/Grid';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import TextInput from '@/components/ui/inputs/TextInput';
import TopBar from '@/components/ui/topBar/TopBar';
import BackButton from '@/components/ui/buttons/BackButton';
import {
  EXERCISE_RETURN_PATH_KEY,
  PENDING_EXERCISE_TEMPLATE_ID_KEY,
  PENDING_EXERCISE_WORKOUT_ID_KEY,
} from '@/app/constants/storageConstants';
import { cn } from '@/lib/utils';
import { addExercise, getExercisesByWorkout } from '@/services/exercises';
import { canEditWorkout } from '@/services/workouts';
import { LOCKED_WORKOUT_MESSAGE } from '@/services/serviceError';
import { addTemplateExercise } from '@/services/workoutTemplates';
import {
  getExercisesList,
  GetExercisesListReturnData,
} from '@/services/exercisesList';

function subscribeNoop() {
  return () => {};
}

function readPendingWorkoutId() {
  return window.sessionStorage.getItem(PENDING_EXERCISE_WORKOUT_ID_KEY);
}

function readPendingTemplateId() {
  return window.sessionStorage.getItem(PENDING_EXERCISE_TEMPLATE_ID_KEY);
}

function readOnServer() {
  return null;
}

export default function AddExerciseList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const muscle = searchParams.get('muscle')?.trim() || null;

  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const workoutId = useSyncExternalStore(
    subscribeNoop,
    readPendingWorkoutId,
    readOnServer
  );
  const templateId = useSyncExternalStore(
    subscribeNoop,
    readPendingTemplateId,
    readOnServer
  );
  const targetId = workoutId ?? templateId;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listResult, setListResult] = useState<{
    query: string;
    rows: GetExercisesListReturnData[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInitialLoading = listResult === null;

  const columns: GridColumn<GetExercisesListReturnData>[] = [
    { key: 'name', header: 'Exercise', align: 'left' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!targetId) return;

    let cancelled = false;

    getExercisesList({ name: debouncedSearch, primaryMuscles: muscle })
      .then((data) => {
        if (cancelled) return;
        setListResult({ query: debouncedSearch, rows: data });
        setError(null);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setListResult({ query: debouncedSearch, rows: [] });
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load exercises.'
        );
      })
      .finally(() => {
        setIsClearing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetId, debouncedSearch, muscle]);

  function returnToSource() {
    const returnPath = window.sessionStorage.getItem(EXERCISE_RETURN_PATH_KEY);
    window.sessionStorage.removeItem(PENDING_EXERCISE_WORKOUT_ID_KEY);
    window.sessionStorage.removeItem(PENDING_EXERCISE_TEMPLATE_ID_KEY);
    window.sessionStorage.removeItem(EXERCISE_RETURN_PATH_KEY);

    if (returnPath && window.history.length <= 1) {
      router.replace(returnPath);
    } else {
      router.back();
    }
  }

  async function handlePick(item: GetExercisesListReturnData) {
    if (isSubmitting || !targetId) return;

    setError(null);
    setIsSubmitting(true);

    if (!workoutId && templateId) {
      try {
        await addTemplateExercise({
          templateId,
          name: item.name,
          exerciseListId: item.id,
        });
        returnToSource();
      } catch (addError) {
        setError(
          addError instanceof Error
            ? addError.message
            : 'Could not add exercise.'
        );
        setIsSubmitting(false);
      }
      return;
    }

    if (!workoutId) return;

    try {
      const [isEditable, existing] = await Promise.all([
        canEditWorkout(workoutId),
        getExercisesByWorkout(workoutId),
      ]);

      if (!isEditable) {
        setError(LOCKED_WORKOUT_MESSAGE);
        setIsSubmitting(false);
        return;
      }

      await addExercise({
        workoutId,
        name: item.name,
        exerciseListId: item.id,
        order:
          existing.reduce(
            (max, exercise) => Math.max(max, exercise.exercise_order),
            0
          ) + 1,
      });

      returnToSource();
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : 'Could not add exercise.'
      );
      setIsSubmitting(false);
    }
  }

  function openMusclePicker() {
    router.replace(`${pathname}/choose-muscle`);
  }

  function clearMuscle() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('muscle');
    const query = next.toString();
    setIsClearing(true);
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <main className="page page-padded page-fill">
      <div className="page-content page-content-narrow page-fill-content relative">
        <TopBar
          left={<BackButton onClick={() => router.back()} />}
          center="Select exercise"
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        {!isClient || (targetId && isInitialLoading) ? (
          <div className="content-center">
            <LoadingCircle />
          </div>
        ) : !targetId ? (
          <div className="content-center flex-col gap-4">
            <p className="muted-text">Missing workout id.</p>
            <Button onClick={() => router.back()} width="1/2">
              Back
            </Button>
          </div>
        ) : (
          <div className="page-fill-content">
            <div className="exercise-filters">
              <div className="exercise-filter-row">
                <button
                  type="button"
                  onClick={openMusclePicker}
                  className={cn('chip flex-1', muscle && 'chip-active')}
                >
                  {muscle ? `Muscle: ${muscle}` : 'Filter by muscle'}
                </button>

                {muscle && (
                  <button
                    type="button"
                    onClick={clearMuscle}
                    className="chip text-content-muted"
                  >
                    Clear
                  </button>
                )}
              </div>

              <TextInput
                placeholder="Search exercises"
                value={search}
                onChange={setSearch}
              />
            </div>

            <div className="page-fill-content">
              <Grid
                columns={1}
                columnConfig={columns}
                data={listResult?.rows ?? []}
                keyExtractor={(item) => item.id}
                onRowClick={handlePick}
                emptyMessage={
                  muscle
                    ? `No exercises for "${muscle}".`
                    : listResult?.query
                      ? `No exercises matching "${listResult.query}".`
                      : 'No exercises found.'
                }
              />
            </div>
          </div>
        )}

        {(isSubmitting || isClearing) && (
          <div className="busy-overlay">
            <LoadingCircle size={44} />
          </div>
        )}
      </div>
    </main>
  );
}
