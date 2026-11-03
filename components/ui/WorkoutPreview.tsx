'use client';

import { createElement, useState } from 'react';
import { motion } from 'motion/react';
import {
  Icon,
  IconCircleCheck,
  IconClock,
  IconGauge,
  IconPencil,
  IconRoute,
  IconX,
} from '@tabler/icons-react';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { cn } from '@/lib/utils';
import { getSetsByExercise, ReturnGetSetsData } from '@/services/sets';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { ReturnGetExercisesData } from '@/services/exercises';
import { ReturnGetMetricsData } from '@/services/workoutMetrics';
import { ReturnGetWorkoutsData } from '@/services/workouts';
import Button from './buttons/Button';
import { formatDuration, formatDistance, formatPace } from '@/lib/format';
import { getFormatedDate, iconBasedOnRange, parseDateKey } from '@/lib/helpers';
import { getWorkoutTypeIcon } from '@/lib/workoutTypeIcon';
import ExerciseAccordion from './ExerciseAccordion';

type SetDraft = {
  reps: string;
  weight: string;
};

type MetricTile = {
  label: string;
  value: string;
  icon: Icon;
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

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function formatTime(minutes: number | null) {
  const { h, m } = formatDuration(minutes);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function formatKm(meters: number | null) {
  const { km } = formatDistance(meters);
  return `${Number.isInteger(km) ? km : km.toFixed(2).replace(/0$/, '')} km`;
}

function formatSpeed(minutes: number | null, meters: number | null) {
  return `${formatPace(minutes, meters)} km/h`;
}

function formatDay(value: string, withYear = true) {
  return getFormatedDate({
    date: parseDateKey(value.slice(0, 10)),
    showYear: withYear,
    nameMonth: true,
  });
}

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

  const isCompleted = Boolean(workout.completed_at);

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

  function renderMetrics(tiles: MetricTile[]) {
    if (!metrics) {
      return (
        <p className="preview-empty">No results yet. Use Edit to add them.</p>
      );
    }

    const wellBeing = metrics.well_being;
    const isInline = tiles.length === 1 && wellBeing !== null;

    return (
      <div className="preview-metrics">
        <div
          className="preview-metric-grid"
          style={
            {
              '--grid-columns': tiles.length + (isInline ? 1 : 0),
            } as React.CSSProperties
          }
        >
          {tiles.map((tile) => (
            <div key={tile.label} className="metric-card">
              <span className="metric-card-icon">
                {createElement(tile.icon, { size: 16, stroke: 2 })}
              </span>
              <span className="metric-card-value">{tile.value}</span>
              <span className="metric-card-label">{tile.label}</span>
            </div>
          ))}

          {isInline && renderWellBeing(wellBeing, true)}
        </div>

        {!isInline && wellBeing !== null && renderWellBeing(wellBeing, false)}
      </div>
    );
  }

  function renderWellBeing(value: number, isCompact: boolean) {
    const face = iconBasedOnRange({ value, min: 1, max: 10 });
    const bar = (
      <div className="wellbeing-track">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 }}
          className="wellbeing-fill"
        />
      </div>
    );

    if (isCompact) {
      return (
        <div className="metric-card">
          <span className="metric-card-icon wellbeing-face">{face}</span>
          <span className="metric-card-value">{value}/10</span>
          <span className="metric-card-label">Well-being</span>
          {bar}
        </div>
      );
    }

    return (
      <div className="wellbeing-card">
        <div className="wellbeing-header">
          <span className="wellbeing-label">Well-being</span>
          <span className="wellbeing-value">
            <span className="wellbeing-face">{face}</span>
            {value}/10
          </span>
        </div>
        {bar}
      </div>
    );
  }

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex justify-center p-4">
          <LoadingCircle />
        </div>
      );
    }

    if (workoutGroup === 'RepetitionBased') {
      if (exercises.length === 0) {
        return (
          <p className="preview-empty">
            No exercises yet. Use Edit to add them.
          </p>
        );
      }
      return (
        <>
          <p className="preview-section-title">
            {exercises.length}{' '}
            {exercises.length === 1 ? 'exercise' : 'exercises'}
          </p>
          {exercises.map((exercise, index) => {
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
          })}
        </>
      );
    }

    const minutes = metrics?.duration_minutes ?? null;
    const meters = metrics?.distance_meters ?? null;

    if (workoutGroup === 'DurationOnly') {
      return renderMetrics([
        { label: 'Time', value: formatTime(minutes), icon: IconClock },
      ]);
    }

    if (workoutGroup === 'DistanceDuration') {
      return renderMetrics([
        { label: 'Time', value: formatTime(minutes), icon: IconClock },
        { label: 'Distance', value: formatKm(meters), icon: IconRoute },
        {
          label: 'Avg speed',
          value: formatSpeed(minutes, meters),
          icon: IconGauge,
        },
      ]);
    }

    return null;
  }

  return (
    <motion.section
      ref={previewRef as React.RefObject<HTMLElement>}
      key={workout.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="workout-preview"
    >
      <div className="workout-preview-header">
        <span className="workout-preview-icon">
          {createElement(
            getWorkoutTypeIcon(
              workout.workout_types.name,
              workout.workout_types.workout_group
            ),
            { size: 24, stroke: 1.75 }
          )}
        </span>
        <div className="workout-preview-heading">
          <h2 className="workout-preview-title">{workout.name}</h2>
          <p className="workout-preview-meta">
            {workout.workout_types.name} · {formatDay(workout.workout_date)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="workout-preview-close"
        >
          <IconX size={18} stroke={2.25} />
        </button>
      </div>

      <span
        className={cn(
          'workout-preview-status',
          isCompleted && 'workout-preview-status-done'
        )}
      >
        {isCompleted ? 'Completed' : 'In progress'}
      </span>

      {error && (
        <div role="alert" className="workout-preview-error">
          {error}
        </div>
      )}

      <div className="workout-preview-content">{renderContent()}</div>

      <div className="workout-preview-actions">
        {isCompleted ? (
          <div className="workout-preview-done">
            <IconCircleCheck size={20} stroke={2} />
            <span>
              Completed
              {workout.completed_at &&
                ` on ${formatDay(workout.completed_at, false)}`}
            </span>
          </div>
        ) : (
          <>
            <Button onClick={onEdit} variant="secondary" width="full">
              <IconPencil size={18} stroke={2} />
              Edit
            </Button>
            <Button onClick={onConfirm} width="full">
              <IconCircleCheck size={18} stroke={2} />
              Complete
            </Button>
          </>
        )}
      </div>
    </motion.section>
  );
}
