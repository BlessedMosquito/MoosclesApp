'use client';

import { useState } from 'react';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { cn } from '@/lib/utils';
import { getSetsByExercise, ReturnGetSetsData } from '@/services/sets';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { ReturnGetExercisesData } from '@/services/exercises';
import { ReturnGetMetricsData } from '@/services/workoutMetrics';
import { ReturnGetWorkoutsData } from '@/services/workouts';
import CloseIcon from '../icons/CloseIcon';
import Button from './buttons/Button';
import { formatDuration, formatDistance, formatPace } from '@/lib/format';
import { iconBasedOnRange } from '@/lib/helpers';
import ExerciseAccordion from './ExerciseAccordion';
import CompletedSection from './CompletedSection';

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
      <div key={label} className="metric-card">
        <p className="metric-card-label">{label}</p>
        <p className="metric-card-value">{value}</p>
      </div>
    );
  }

  function renderWellBeing(well_being: number | null) {
    return (
      <div className="metric-card metric-card-row">
        <p className="metric-card-label">Well-being during workout:</p>

        {well_being !== null && (
          <div className="metric-card-wellbeing">
            <p className="metric-card-value">{well_being}</p>
            {iconBasedOnRange({ value: well_being, min: 1, max: 10 })}
          </div>
        )}
      </div>
    );
  }

  function renderMetrics(cards: [string, string][]) {
    if (!metrics) return <p className="preview-empty">No data added.</p>;

    return (
      <div className="preview-metrics">
        <div
          className={cn(
            'preview-metric-grid',
            cards.length > 1 && 'grid-cols-3'
          )}
        >
          {cards.map(([label, value]) => renderMetricCard(label, value))}
        </div>
        {renderWellBeing(metrics.well_being)}
      </div>
    );
  }

  return (
    <section
      ref={previewRef as React.RefObject<HTMLElement>}
      className="workout-preview"
    >
      <div className="workout-preview-header">
        <h2 className="workout-preview-title">{`Name: ${workout.name}`}</h2>
        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="icon-btn ml-auto"
        >
          <CloseIcon />
        </button>
      </div>

      <p className="workout-preview-type">
        {`Workout type: ${workout.workout_types.name}`}
      </p>

      {error && (
        <div role="alert" className="workout-preview-error">
          {error}
        </div>
      )}

      <div className="workout-preview-content">
        {isLoading ? (
          <div className="flex justify-center p-2">
            <LoadingCircle />
          </div>
        ) : workoutGroup === 'RepetitionBased' ? (
          exercises.length === 0 ? (
            <p className="preview-empty">No exercises added.</p>
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
          renderMetrics([
            ['Time', formatDurationToString(metrics?.duration_minutes ?? null)],
          ])
        ) : workoutGroup === 'DistanceDuration' ? (
          renderMetrics([
            ['Time', formatDurationToString(metrics?.duration_minutes ?? null)],
            [
              'Distance',
              formatDistanceToString(metrics?.distance_meters ?? null),
            ],
            [
              'Pace',
              formatPaceToString(
                metrics?.duration_minutes ?? null,
                metrics?.distance_meters ?? null
              ),
            ],
          ])
        ) : null}
      </div>

      <div className="workout-preview-actions">
        {workout.completed_at ? (
          <CompletedSection />
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
