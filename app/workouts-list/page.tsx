'use client';

import ChevronIcon from '@/components/icons/ChevronIcon';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import Grid, { GridColumn } from '@/components/ui/Grid';
import TextInput from '@/components/ui/inputs/TextInput';
import TopBar from '@/components/ui/topBar/TopBar';
import { createClient } from '@/lib/supabase/client';
import { s, useResponsive } from '@/lib/useResponsive';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { getWorkouts, ReturnGetWorkoutsData } from '@/services/workouts';
import { colors } from '@/theme/colors';
import { Mode } from '@/types/common';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function formatWorkoutDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function WorkoutsList() {
  const router = useRouter();
  const { isMobile, isTablet, scale } = useResponsive();

  const [workouts, setWorkouts] = useState<ReturnGetWorkoutsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  const columns: GridColumn<ReturnGetWorkoutsData>[] = [
    { key: 'name', header: 'Name', align: 'left' },
    {
      key: 'workout_date',
      header: 'Date',
      align: 'right',
      render: (item) => formatWorkoutDate(item.workout_date),
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkouts() {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

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
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load workouts.'
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadWorkouts();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  function openWorkout(workout: ReturnGetWorkoutsData) {
    const workoutGroupType = workout.workout_types
      .workout_group as WorkoutTypeGroup;

    const workoutDataView: Record<WorkoutTypeGroup, string> = {
      DistanceDuration: '/distance-duration',
      DurationOnly: '/distance-duration',
      RepetitionBased: '/repetition-based',
    };

    const path = workoutDataView[workoutGroupType];

    if (!path) return;

    const params = new URLSearchParams({
      workoutId: String(workout.id),
      mode: 'PREVIEW' as Mode,
    });

    router.push(`/add-workout-data${path}?${params.toString()}`);
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
          center="Workouts"
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <TextInput
          placeholder="Search workouts"
          value={search}
          onChange={setSearch}
        />

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isLoading ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <LoadingCircle />
            </div>
          ) : (
            <Grid
              numberedRows={true}
              columns={columns.length}
              columnConfig={columns}
              data={workouts}
              keyExtractor={(item) => item.id}
              onRowClick={openWorkout}
              emptyMessage={
                debouncedSearch
                  ? `No workouts matching "${debouncedSearch}".`
                  : 'No workouts yet.'
              }
              rowBorderColor={(item) =>
                item.completed_at ? colors.accent : undefined
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}
