'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import Grid, { GridColumn } from '@/components/ui/Grid';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import TextInput from '@/components/ui/inputs/TextInput';
import TopBar from '@/components/ui/topBar/TopBar';
import ChevronIcon from '@/components/icons/ChevronIcon';
import {
  EXERCISE_RETURN_PATH_KEY,
  PENDING_EXERCISE_WORKOUT_ID_KEY,
} from '@/app/constants/storageConstants';
import { s, useResponsive } from '@/lib/useResponsive';
import { addExercise, getExercisesByWorkout } from '@/services/exercises';
import {
  getExercisesList,
  GetExercisesListReturnData,
} from '@/services/exercisesList';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

function subscribeNoop() {
  return () => {};
}

function readPendingWorkoutId() {
  return window.sessionStorage.getItem(PENDING_EXERCISE_WORKOUT_ID_KEY);
}

function readPendingWorkoutIdOnServer() {
  return null;
}

export default function AddExerciseList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const muscle = searchParams.get('muscle')?.trim() || null;

  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const workoutId = useSyncExternalStore(
    subscribeNoop,
    readPendingWorkoutId,
    readPendingWorkoutIdOnServer
  );

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listResult, setListResult] = useState<{
    query: string;
    rows: GetExercisesListReturnData[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;
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
    if (!workoutId) return;

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
  }, [workoutId, debouncedSearch, muscle]);

  async function handlePick(item: GetExercisesListReturnData) {
    if (isSubmitting || !workoutId) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const existing = await getExercisesByWorkout(workoutId);

      await addExercise({
        workoutId,
        name: item.name,
        exerciseListId: item.id,
        order: existing.length + 1,
      });

      const returnPath = window.sessionStorage.getItem(
        EXERCISE_RETURN_PATH_KEY
      );
      window.sessionStorage.removeItem(PENDING_EXERCISE_WORKOUT_ID_KEY);
      window.sessionStorage.removeItem(EXERCISE_RETURN_PATH_KEY);

      if (returnPath) {
        router.replace(returnPath);
      } else {
        router.back();
      }
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
    <main
      style={{
        background: 'transparent',
        padding: s(isMobile ? 18 : 28, scale),
        color: colors.text,
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: contentMaxWidth,
          height: '100%',
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: s(16, scale),
        }}
      >
        <TopBar
          left={
            <button
              style={{ rotate: '-180deg', cursor: 'pointer' }}
              onClick={() => router.back()}
            >
              <ChevronIcon />
            </button>
          }
          center="Select exercise"
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        {!isClient || (workoutId && isInitialLoading) ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LoadingCircle />
          </div>
        ) : !workoutId ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: s(16, scale),
            }}
          >
            <p
              style={{
                margin: 0,
                color: colors.textMuted,
                fontSize: s(fontSizes.bodySmall, scale),
                textAlign: 'center',
              }}
            >
              Missing workout id.
            </p>
            <Button onClick={() => router.back()} width="1/2">
              Back
            </Button>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: s(16, scale),
            }}
          >
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: s(10, scale),
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: s(8, scale),
                }}
              >
                <button
                  onClick={openMusclePicker}
                  style={{
                    flex: 1,
                    padding: `${s(10, scale)}px ${s(14, scale)}px`,
                    borderRadius: s(14, scale),
                    border: `1px solid ${
                      muscle ? colors.accent : colors.border
                    }`,
                    background: muscle
                      ? colors.accentSurface
                      : colors.componentsBg,
                    color: muscle ? colors.accent : colors.text,
                    fontSize: s(fontSizes.bodySmall, scale),
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {muscle ? `Muscle: ${muscle}` : 'Filter by muscle'}
                </button>

                {muscle && (
                  <button
                    onClick={clearMuscle}
                    style={{
                      padding: `${s(10, scale)}px ${s(14, scale)}px`,
                      borderRadius: s(14, scale),
                      border: `1px solid ${colors.border}`,
                      background: colors.componentsBg,
                      color: colors.textMuted,
                      fontSize: s(fontSizes.bodySmall, scale),
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
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

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
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
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(23, 23, 23, 0.72)',
              pointerEvents: 'none',
            }}
          >
            <LoadingCircle size={44} />
          </div>
        )}
      </div>
    </main>
  );
}
