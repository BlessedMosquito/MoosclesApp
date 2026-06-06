'use client';

import { UIEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';
import LoadingCircle from '@/components/ui/LoadingCircle';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { s, useResponsive } from '@/lib/useResponsive';
import { createWorkout } from '@/services/workouts';
import {
  getWorkoutTypeGroup,
  getWorkoutTypes,
  type WorkoutTypeProperties,
} from '@/services/workoutTypes';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type  WorkoutTypeGroup = 'DurationOnly' | 'DistanceDuration' | 'RepetitionBased'

const pickerItemHeight = 44;

export default function AddWorkoutPage() {
  const router = useRouter();
  const { isMobile, isTablet, scale } = useResponsive();
  const pickerRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutTypeProperties[]>([]);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedType = workoutTypes[selectedTypeIndex];
  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  useEffect(() => {
    async function loadWorkoutTypes() {
      try {
        const types = await getWorkoutTypes();
        setWorkoutTypes(types);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load workout types.'
        );
      }
    }

    loadWorkoutTypes();
  }, []);

  function handlePickerScroll(event: UIEvent<HTMLDivElement>) {
    if (workoutTypes.length === 0) {
      return;
    }

    const nextIndex = Math.round(event.currentTarget.scrollTop / pickerItemHeight);
    const boundedIndex = Math.min(Math.max(nextIndex, 0), workoutTypes.length - 1);
    setSelectedTypeIndex(boundedIndex);
  }

  async function goToExercises() {
    setError(null);
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Workout name is required.');
      return;
    }

    if (!selectedType) {
      setError('Choose workout type.');
      return;
    }

    setIsSaving(true);

    try {
      const workout = await createWorkout({
        name: trimmedName,
        workoutType: selectedType.id,
        date: new Date(),
      });

      const workoutTypeGroup = await getWorkoutTypeGroup(selectedType.id);

      const workoutDataView: Record<WorkoutTypeGroup, string> = {
        'DistanceDuration': '/distance-duration',
        'DurationOnly': '/distance-duration',
        'RepetitionBased': '/repetition-based'
      }
      
      if (!workoutTypeGroup) {
        setError('Workout type group not found');
        return;
      }
      const path = workoutDataView[workoutTypeGroup as WorkoutTypeGroup];

      if(!path){
        throw new Error('Unsupported workout group')
      }

      router.push(
        `/add-workout-data${path}?workoutId=${workout.id}&name=${encodeURIComponent(trimmedName)}&type=${encodeURIComponent(selectedType.label)}`
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not create workout.'
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
        <BackButton onClick={() => router.push('/dashboard')} />

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
            Step 1 of 2
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
            Add Workout
          </h1>

          <p
            style={{
              margin: `${s(10, scale)}px 0 0`,
              color: colors.textSecondary,
              fontSize: s(fontSizes.bodySmall, scale),
              lineHeight: 1.5,
            }}
          >
            Name the session and choose the workout type.
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
            gap: s(22, scale),
          }}
        >
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: s(8, scale),
              color: colors.textSecondary,
              fontSize: s(fontSizes.caption, scale),
            }}
          >
            Workout name
            <input
              placeholder="Push day"
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: s(14, scale),
                borderRadius: s(14, scale),
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.text,
                fontSize: s(fontSizes.input, scale),
                outline: 'none',
              }}
            />
          </label>

          <div>
            <p
              style={{
                margin: `0 0 ${s(10, scale)}px`,
                color: colors.textSecondary,
                fontSize: s(fontSizes.caption, scale),
              }}
            >
              Workout type
            </p>

            <div
              style={{
                position: 'relative',
                height: pickerItemHeight * 5,
                borderRadius: s(18, scale),
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: s(12, scale),
                  right: s(12, scale),
                  height: pickerItemHeight,
                  transform: 'translateY(-50%)',
                  borderRadius: s(12, scale),
                  background: colors.glassHover,
                  pointerEvents: 'none',
                }}
              />

              <div
                ref={pickerRef}
                onScroll={handlePickerScroll}
                style={{
                  height: '100%',
                  overflowY: 'auto',
                  scrollSnapType: 'y mandatory',
                  padding: `${pickerItemHeight * 2}px 0`,
                }}
              >
                  {workoutTypes.length === 0 ? (
                    <div
                      style={{
                        height: pickerItemHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        scrollSnapAlign: 'center',
                      }}
                    >
                      <LoadingCircle size={18} />
                    </div>
                ) : (
                  workoutTypes.map((type, index) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setSelectedTypeIndex(index);
                        pickerRef.current?.scrollTo({
                          top: index * pickerItemHeight,
                          behavior: 'smooth',
                        });
                      }}
                      style={{
                        width: '100%',
                        height: pickerItemHeight,
                        border: 'none',
                        background: 'transparent',
                        color:
                          index === selectedTypeIndex
                            ? colors.text
                            : colors.textMuted,
                        fontSize:
                          index === selectedTypeIndex
                            ? s(fontSizes.body, scale)
                            : s(fontSizes.bodySmall, scale),
                        fontWeight: index === selectedTypeIndex ? 700 : 400,
                        scrollSnapAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {type.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <PrimaryButton
            onClick={goToExercises}
            disabled={isSaving}
            width={'3/4'}
            align={'center'}
          >
            {isSaving ? 'Creating...' : 'Next'}
          </PrimaryButton>
          
        </section>
      </div>
    </main>
  );
}
