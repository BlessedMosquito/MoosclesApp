'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';
import LoadingCircle from '@/components/ui/LoadingCircle';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { getExercisesByWorkout } from '@/services/exercises';
import { getWorkouts } from '@/services/workouts';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { getSetsByExercise } from '@/services/sets';

type Workout = {
  id: number | string;
  name: string;
  workout_date: string;
  workout_types?: {
    label?: string;
  } | null;
};

type Exercise = {
  id: number;
  name: string;
};

type ExerciseSet = {
  id: number | string;
  reps: number;
  weight: number;
};

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const yearOptions = Array.from({ length: 21 }, (_, index) => 2010 + index);

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getWorkoutDateKey(workoutDate: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(workoutDate)) {
    return workoutDate;
  }

  return toDateKey(new Date(workoutDate));
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const days: Array<Date | null> = [];

  for (let index = 0; index < leadingDays; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();
  const previewRef = useRef<HTMLElement>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
  const year = Number(searchParams.get('year'));
  const month = Number(searchParams.get('month'));


    if (year && month >= 1 && month <= 12) {
      return new Date(year, month - 1, 1);
    }

    return new Date();
  });
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [setsByExercise, setSetsByExercise] = useState<Record<string, ExerciseSet[]>>({});
  const [loadingSetsByExercise, setLoadingSetsByExercise] = useState<Record<string, boolean>>({});
  

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 760 : 980;
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const monthLabel = visibleMonth.toLocaleDateString('en-US', {
    month: 'long',
  });
  const visibleYear = visibleMonth.getFullYear();
  const selectedWorkoutFromParams = searchParams.get('workoutId');

  const workoutsByDay = useMemo(() => {
    return workouts.reduce<Record<string, Workout[]>>((result, workout) => {
      const key = getWorkoutDateKey(workout.workout_date);
      result[key] = [...(result[key] ?? []), workout];
      return result;
    }, {});
  }, [workouts]);

  useEffect(() => {
    async function loadWorkouts() {
      setIsLoading(true);
      setError(null);

      try {
        const workoutData = await getWorkouts();
        setWorkouts(workoutData as Workout[]);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load workouts.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkouts();
  }, []);

  useEffect(() => {
    if (!selectedWorkoutFromParams || workouts.length === 0 || selectedWorkout) {
      return;
    }

    const workout = workouts.find(
      (workoutItem) => String(workoutItem.id) === selectedWorkoutFromParams
    );

    if (workout) {
      openWorkout(workout);
    }
  }, [selectedWorkoutFromParams, workouts, selectedWorkout]);

  async function openWorkout(workout: Workout) {
    setSelectedWorkout(workout);
    setExercises([]);
    setIsLoadingExercises(true);
    setError(null);

    window.setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);

    try {
      const exerciseData = await getExercisesByWorkout(workout.id);
      setExercises(exerciseData as Exercise[]);
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

  function changeMonth(offset: number) {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    );
    setSelectedWorkout(null);
    setExercises([]);
    setIsYearPickerOpen(false);
  }

  function changeYear(year: number) {
    setVisibleMonth(
      (currentMonth) => new Date(year, currentMonth.getMonth(), 1)
    );
    setSelectedWorkout(null);
    setExercises([]);
    setIsYearPickerOpen(false);
  }

  function goToAddExercises() {
    if (!selectedWorkout) {
      return;
    }

    const params = new URLSearchParams({
      workoutId: String(selectedWorkout.id),
      name: selectedWorkout.name,
      type: selectedWorkout.workout_types?.label ?? 'workout',
      from: 'calendar',
      year: String(visibleMonth.getFullYear()),
      month: String(visibleMonth.getMonth() + 1),
    });

    router.push(`/add-workout-data?${params.toString()}`);
  }

  async function toggleExercise(exercise: Exercise) {
      const exerciseId = String(exercise.id);
  
      if (expandedExerciseId === exerciseId) {
        setExpandedExerciseId(null);
        return;
      }
  
      setExpandedExerciseId(exerciseId);
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

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: colors.background,
        padding: s(isMobile ? 18 : 24, scale),
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
        <BackButton onClick={() => router.push('/dashboard')} />

        <header
          style={{
            marginTop: s(isMobile ? 20 : 28, scale),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: s(14, scale),
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: s(
                  isMobile ? fontSizes.heading1 : fontSizes.display,
                  scale
                ),
                fontWeight: 700,
              }}
            >
              Calendar
            </h1>

            <p
              style={{
                margin: `${s(8, scale)}px 0 0`,
                color: colors.textSecondary,
                fontSize: s(fontSizes.bodySmall, scale),
              }}
            >
              Tap a workout to preview exercises.
            </p>
          </div>
        </header>

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
            marginTop: s(isMobile ? 16 : 24, scale),
            border: `1px solid ${colors.border}`,
            borderRadius: s(isMobile ? 16 : 20, scale),
            background: colors.surface,
            padding: s(isMobile ? 8 : 18, scale),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: s(isMobile ? 10 : 16, scale),
            }}
          >
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: s(12, scale),
                background: colors.glass,
                color: colors.text,
                width: s(isMobile ? 32 : 38, scale),
                height: s(isMobile ? 32 : 38, scale),
                cursor: 'pointer',
              }}
            >
              {'<'}
            </button>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: s(4, scale),
              }}
            >
              <button
                type="button"
                onClick={() => setIsYearPickerOpen((isOpen) => !isOpen)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: colors.text,
                  padding: 0,
                  fontSize: s(isMobile ? fontSizes.heading1 : fontSizes.display, scale),
                  fontWeight: 700,
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
              >
                {visibleYear}
              </button>

              <h2
                style={{
                  margin: 0,
                  fontSize: s(isMobile ? fontSizes.body : fontSizes.heading2, scale),
                }}
              >
                {monthLabel}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: s(12, scale),
                background: colors.glass,
                color: colors.text,
                width: s(isMobile ? 32 : 38, scale),
                height: s(isMobile ? 32 : 38, scale),
                cursor: 'pointer',
              }}
            >
              {'>'}
            </button>
          </div>

          {isYearPickerOpen ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: s(isMobile ? 8 : 12, scale),
              }}
            >
              {yearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => changeYear(year)}
                  style={{
                    minHeight: s(isMobile ? 54 : 72, scale),
                    border: `2px solid ${
                      year === visibleYear ? colors.text : colors.border
                    }`,
                    borderRadius: s(14, scale),
                    background:
                      year === visibleYear ? colors.glassHover : colors.glass,
                    color: colors.text,
                    fontSize: s(isMobile ? fontSizes.body : fontSizes.heading2, scale),
                    fontWeight: year === visibleYear ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: s(isMobile ? 3 : 6, scale),
              }}
            >
              {weekdays.map((weekday) => (
                <div
                  key={weekday}
                  style={{
                    color: colors.textMuted,
                    fontSize: s(fontSizes.caption, scale),
                    textAlign: 'center',
                    paddingBottom: s(isMobile ? 2 : 4, scale),
                  }}
                >
                  {weekday}
                </div>
              ))}

              {monthDays.map((day, index) => {
                const key = day ? toDateKey(day) : `empty-${index}`;
                const dayWorkouts = day ? workoutsByDay[toDateKey(day)] ?? [] : [];
                const visibleWorkouts = dayWorkouts.slice(0, isMobile ? 1 : 3);
                const remainingWorkouts = dayWorkouts.length - visibleWorkouts.length;
                const hasWorkouts = dayWorkouts.length > 0;

                return (
                  <div
                    key={key}
                    role={hasWorkouts ? 'button' : undefined}
                    tabIndex={hasWorkouts ? 0 : undefined}
                    onClick={() => {
                      if (hasWorkouts) {
                        openWorkout(dayWorkouts[0]);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (hasWorkouts && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        openWorkout(dayWorkouts[0]);
                      }
                    }}
                    style={{
                      minHeight: s(isMobile ? 54 : 112, scale),
                      borderRadius: s(isMobile ? 8 : 12, scale),
                      border: `1px solid ${day ? colors.border : 'transparent'}`,
                      background: day ? 'rgba(255,255,255,0.025)' : 'transparent',
                      padding: s(isMobile ? 3 : 6, scale),
                      overflow: 'hidden',
                      cursor: hasWorkouts ? 'pointer' : 'default',
                    }}
                  >
                    {day && (
                      <>
                        <p
                          style={{
                            margin: 0,
                            color: colors.textSecondary,
                            fontSize: s(isMobile ? 10 : fontSizes.caption, scale),
                          }}
                        >
                          {day.getDate()}
                        </p>

                        <div
                          style={{
                            marginTop: s(6, scale),
                            display: 'flex',
                            flexDirection: 'column',
                            gap: s(isMobile ? 2 : 5, scale),
                          }}
                        >
                          {visibleWorkouts.map((workout) => (
                            <button
                              key={workout.id}
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openWorkout(workout);
                              }}
                              style={{
                                width: '100%',
                                border: `1px solid ${colors.borderStrong}`,
                                borderRadius: s(isMobile ? 6 : 8, scale),
                                background:
                                  selectedWorkout?.id === workout.id
                                    ? colors.glassHover
                                    : colors.glass,
                                color: colors.text,
                                padding: `${s(isMobile ? 2 : 5, scale)}px ${s(isMobile ? 3 : 6, scale)}px`,
                                fontSize: s(isMobile ? 8 : 11, scale),
                                textAlign: 'left',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {workout.name}
                            </button>
                          ))}

                          {remainingWorkouts > 0 && (
                            <span
                              style={{
                                color: colors.textMuted,
                                fontSize: s(isMobile ? 8 : 11, scale),
                                lineHeight: 1,
                              }}
                            >
                              +{remainingWorkouts}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isLoading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: s(16, scale),
              }}
            >
              <LoadingCircle />
            </div>
          )}
        </section>

        {selectedWorkout && (
          <section
            ref={previewRef}
            style={{
              marginTop: s(18, scale),
              border: `1px solid ${colors.border}`,
              borderRadius: s(20, scale),
              background: colors.surface,
              padding: s(16, scale),
            }}
          >
            <p
              style={{
                margin: 0,
                color: colors.textMuted,
                fontSize: s(fontSizes.caption, scale),
              }}
            >
              {selectedWorkout.workout_types?.label ?? 'Workout'}
            </p>

            <h2
              style={{
                margin: `${s(6, scale)}px 0 0`,
                fontSize: s(fontSizes.heading2, scale),
              }}
            >
              {selectedWorkout.name}
            </h2>

            <div
              style={{
                marginTop: s(14, scale),
                display: 'flex',
                flexDirection: 'column',
                gap: s(8, scale),
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
                  No exercises added.
                </p>
              ) : (
                exercises.map((exercise, index) => {
                  const exerciseId = String(exercise.id);
                  const isExpanded = expandedExerciseId === exerciseId;
                  const exerciseSets = setsByExercise[exerciseId] ?? [];
                  const isLoadingSets = loadingSetsByExercise[exerciseId];
                return(
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

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr auto',
                          gap: s(8, scale),
                        }}
                      > 
                      </div>
                    </div>
                  )}
                  </div>
                )})
              )}
            </div>
            <div
              style={{
                marginTop: s(16, scale),
              }}
            >
              <PrimaryButton 
              onClick={goToAddExercises}
              width={'1/2'}
              align='center'
              >
                Edit exercises
              </PrimaryButton>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
