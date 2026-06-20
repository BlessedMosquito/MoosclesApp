'use client';

import { useState } from 'react';
import LoadingCircle from '@/components/ui/LoadingCircle';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { getSetsByExercise, ReturnGetSetsData } from '@/services/sets';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { ReturnGetExercisesData } from '@/services/exercises';
import { ReturnGetMetricsData } from '@/services/workoutMetrics';
import { ReturnGetWorkoutsData } from '@/services/workouts';
import CloseIcon from '../icons/CloseIcon';

function formatDuration(seconds: number | null): string {
  if (!seconds) {
    return [0, 0, 0].map((v) => String(v).padStart(2, '0')).join(':');
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function formatDistance(meters: number | null): string {
  if (!meters) {
    return `0/km`;
  }
  const km = meters / 1000;
  if (Number.isInteger(km)) return `${km} km`;
  return `${km
    .toFixed(3)
    .replace(/\.?0+$/, '')
    .replace('.', ',')} km`;
}

function formatPace(secondsPerKm: number | null): string {
  if (!secondsPerKm) {
    return '0/km';
  }
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
}

type WorkoutPreviewProps = {
  workout: ReturnGetWorkoutsData;
  workoutGroup: WorkoutTypeGroup | null;
  exercises: ReturnGetExercisesData[];
  metrics: ReturnGetMetricsData | null;
  isLoading: boolean;
  onEdit: () => void;
  onClose: () => void;
  previewRef: React.RefObject<HTMLElement | null>;
};

export default function WorkoutPreview({
  workout,
  workoutGroup,
  exercises,
  metrics,
  isLoading,
  onEdit,
  onClose,
  previewRef,
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

  function renderMetricCard(label: string, value: string) {
    return (
      <div
        key={label}
        style={{
          padding: s(12, scale),
          borderRadius: s(12, scale),
          border: `1px solid ${colors.border}`,
          background: colors.glass,
        }}
      >
        <p
          style={{
            margin: 0,
            color: colors.textMuted,
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
        background: colors.surface,
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
          {workout.name}
        </h2>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            border: 'none',
            background: 'none',
            color: colors.textMuted,
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
          color: colors.textMuted,
          fontSize: s(fontSizes.caption, scale),
        }}
      >
        {workout.workout_types?.label ?? 'Workout'}
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
                color: colors.textMuted,
                fontSize: s(fontSizes.bodySmall, scale),
              }}
            >
              No exercises added.
            </p>
          ) : (
            exercises.map((exercise, index) => {
              const exerciseId = String(exercise.id);
              const isExpanded = expandedExerciseId === exerciseId;
              const exerciseSets = setsByExercise[exerciseId] ?? [];
              const isLoadingSets = loadingSetsByExercise[exerciseId];

              return (
                <div
                  key={exercise.id}
                  style={{
                    padding: s(12, scale),
                    borderRadius: s(12, scale),
                    border: `1px solid ${colors.border}`,
                    background: colors.glass,
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
                    </div>
                  )}
                </div>
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
                formatDuration(metrics.duration_seconds)
              )}
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                color: colors.textMuted,
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
                formatDuration(metrics.duration_seconds)
              )}
              {renderMetricCard(
                'Distance',
                formatDistance(metrics.distance_meters)
              )}
              {renderMetricCard('Pace', formatPace(metrics.average_pace))}
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                color: colors.textMuted,
                fontSize: s(fontSizes.bodySmall, scale),
              }}
            >
              No data added.
            </p>
          )
        ) : null}
      </div>

      <div style={{ marginTop: s(16, scale) }}>
        <PrimaryButton onClick={onEdit} width="1/2" align="center">
          Edit
        </PrimaryButton>
      </div>
    </section>
  );
}
