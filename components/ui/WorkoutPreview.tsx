'use client';

import { useState } from 'react';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { getSetsByExercise, ReturnGetSetsData } from '@/services/sets';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { ReturnGetExercisesData } from '@/services/exercises';
import { ReturnGetMetricsData } from '@/services/workoutMetrics';
import { ReturnGetWorkoutsData } from '@/services/workouts';
import CloseIcon from '../icons/CloseIcon';
import Button from './Button';
import { formatDuration, formatDistance, formatPace } from '@/lib/format';
import ExerciseAccordion from './ExerciseAccordion';

export function formatDurationToString(seconds: number | null): string {
  const data = formatDuration(seconds);
  return [data.h, data.m].map((v) => String(v).padStart(2, '0')).join(':');
}

export function formatDistanceToString(meters: number | null): string {
  const data = formatDistance(meters);
  if (Number.isInteger(data.km)) return `${data.km} km`;
  return `${data.km
    .toFixed(3)
    .replace(/\.?0+$/, '')
    .replace('.', ',')} km`;
}

export function formatPaceToString(
  durationMinutes: number | null,
  distanceMeters: number | null
): string {
  const pace = formatPace(durationMinutes, distanceMeters);
  return `${pace} km/h`;
}

type SetDraft = {
  reps: string;
  weight: string;
};

type WorkoutPreviewProps = {
  workout: ReturnGetWorkoutsData;
  workoutGroup: WorkoutTypeGroup | null;
  exercises: ReturnGetExercisesData[];
  metrics: ReturnGetMetricsData | null;
  isLoading: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onClose: () => void;
  previewRef: React.RefObject<HTMLElement | null>;
  mode?: 'EDIT' | 'PREVIEW';
};

export default function WorkoutPreview({
  workout,
  workoutGroup,
  exercises,
  metrics,
  isLoading,
  onEdit,
  onConfirm,
  onClose,
  previewRef,
  mode = 'PREVIEW',
}: WorkoutPreviewProps) {
  const { scale } = useResponsive();
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null
  );
  const [setsByExercise, setSetsByExercise] = useState<
    Record<string, ReturnGetSetsData[]>
  >({});
  const [loadingSetsByExercise, setLoadingSetsByExercise] = useState<
    Record<string, boolean>
  >({});
  const [setDrafts, setSetDrafts] = useState<Record<string, SetDraft>>({});
  const [error, setError] = useState<string | null>(null);

  async function toggleExercise(exercise: ReturnGetExercisesData) {
    const exerciseId = String(exercise.id);
    if (expandedExerciseId === exerciseId) {
      setExpandedExerciseId(null);
      return;
    }
    setExpandedExerciseId(exerciseId);
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

  function renderMetricCard(label: string, value: string) {
    return (
      <div
        key={label}
        style={{
          padding: s(12, scale),
          borderRadius: s(12, scale),
          border: `1px solid ${colors.border}`,
          background: colors.componentsBg,
        }}
      >
        <p
          style={{
            margin: 0,
            color: colors.text,
            fontSize: s(fontSizes.caption, scale),
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: `${s(4, scale)}px 0 0`,
            fontWeight: 700,
            fontSize: s(fontSizes.body, scale),
          }}
        >
          {value}
        </p>
      </div>
    );
  }

  return (
    <section
      ref={previewRef as React.RefObject<HTMLElement>}
      style={{
        marginTop: s(18, scale),
        border: `1px solid ${colors.border}`,
        borderRadius: s(20, scale),
        background: colors.componentsBg,
        padding: s(16, scale),
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: s(4, scale),
        }}
      >
        <h2
          style={{
            margin: `${s(6, scale)}px 0 0`,
            fontSize: s(fontSizes.heading2, scale),
          }}
        >
          {`Name: ${workout.name}`}
        </h2>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            border: 'none',
            background: 'none',
            color: colors.text,
            fontSize: s(20, scale),
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
          }}
        >
          <CloseIcon />
        </button>
      </div>

      <p
        style={{
          margin: 0,
          color: colors.text,
          fontSize: s(fontSizes.caption, scale),
        }}
      >
        {`Workout type: ${workout.workout_types.label}`}
      </p>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: s(10, scale),
            padding: s(10, scale),
            borderRadius: s(10, scale),
            border: `1px solid ${colors.errorBorder}`,
            background: colors.errorSurface,
            color: colors.errorMuted,
            fontSize: s(fontSizes.caption, scale),
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: s(14, scale),
          display: 'flex',
          flexDirection: 'column',
          gap: s(8, scale),
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: s(8, scale),
            }}
          >
            <LoadingCircle />
          </div>
        ) : workoutGroup === 'RepetitionBased' ? (
          exercises.length === 0 ? (
            <p
              style={{
                margin: 0,
                color: colors.text,
                fontSize: s(fontSizes.bodySmall, scale),
              }}
            >
              No exercises added.
            </p>
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
                  isLoadingSets={loadingSetsByExercise[exerciseId]}
                  onToggle={toggleExercise}
                  onDraftChange={updateSetDraft}
                  onAddSet={() => {}}
                  mode={mode}
                />
              );
            })
          )
        ) : workoutGroup === 'DurationOnly' ? (
          metrics ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: s(8, scale),
              }}
            >
              {renderMetricCard(
                'Time',
                formatDurationToString(metrics.duration_minutes)
              )}
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                color: colors.text,
                fontSize: s(fontSizes.bodySmall, scale),
              }}
            >
              No data added.
            </p>
          )
        ) : workoutGroup === 'DistanceDuration' ? (
          metrics ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: s(8, scale),
              }}
            >
              {renderMetricCard(
                'Time',
                formatDurationToString(metrics.duration_minutes)
              )}
              {renderMetricCard(
                'Distance',
                formatDistanceToString(metrics.distance_meters)
              )}
              {renderMetricCard(
                'Pace',
                formatPaceToString(
                  metrics.duration_minutes,
                  metrics.distance_meters
                )
              )}
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                color: colors.text,
                fontSize: s(fontSizes.bodySmall, scale),
              }}
            >
              No data added.
            </p>
          )
        ) : null}
      </div>
      <div
        style={{
          marginTop: s(16, scale),
          display: 'flex',
          gap: s(8, scale),
        }}
      >
        {workout.completed_at ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: s(12, scale),
              borderRadius: s(14, scale),
              border: `1px solid ${colors.limeGreen}`,
              background: 'rgba(48,209,88,0.12)',
              color: colors.limeGreen,
              fontSize: s(fontSizes.bodySmall, scale),
              fontWeight: 700,
            }}
          >
            Completed
          </div>
        ) : (
          <>
            <Button onClick={onConfirm} width="3/4" align="center">
              Confirm
            </Button>
            <Button onClick={onEdit} width="3/4" align="center">
              Edit
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
