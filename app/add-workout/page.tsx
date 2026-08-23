'use client';

import Button from '@/components/ui/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import SectionDivider from '@/components/ui/SectionDivider';
import SuccessAnimation from '@/components/ui/feedback/SuccessAnimation';
import WheelPicker from '@/components/ui/inputs/WheelPicker';
import { s, useResponsive } from '@/lib/useResponsive';
import { createWorkout } from '@/services/workouts';
import {
  getWorkoutTypeGroup,
  getWorkoutTypes,
  WorkoutTypeGroup,
  type ReturnGetWorkoutTypeData,
} from '@/services/workoutTypes';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { Mode } from '@/types/common';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function AddWorkoutPage() {
  const router = useRouter();
  const { isMobile, isTablet, scale } = useResponsive();

  const [name, setName] = useState('');
  const [workoutTypes, setWorkoutTypes] = useState<ReturnGetWorkoutTypeData[]>(
    []
  );
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedType = workoutTypes[selectedTypeIndex];
  const contentMaxWidth = isMobile ? '100%' : isTablet ? '620px' : '760px';
  const pendingNavRef = useRef<string | null>(null);

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

  async function handleCreateWorkout() {
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
        DistanceDuration: '/distance-duration',
        DurationOnly: '/distance-duration',
        RepetitionBased: '/repetition-based',
      };

      if (!workoutTypeGroup) {
        setError('Workout type group not found');
        return;
      }

      const path = workoutDataView[workoutTypeGroup as WorkoutTypeGroup];

      if (!path) {
        throw new Error('Unsupported workout group');
      }

      const params = new URLSearchParams({
        workoutId: String(workout.id),
        workoutGroupType: workoutTypeGroup,
        workoutType: selectedType.label,
        name: trimmedName,
        mode: 'NEW' as Mode,
      });

      pendingNavRef.current = `/add-workout-data${path}?${params.toString()}`;
      setShowSuccess(true);
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
        background: 'transparent',
        padding: s(isMobile ? 18 : 28, scale),
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: contentMaxWidth }}>
        <section style={{ marginTop: s(28, scale) }}>
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
            Create today&apos;s workout!
          </h1>
          <p
            style={{
              margin: `${s(10, scale)}px 0 0`,
              color: colors.text,
              fontSize: s(fontSizes.body, scale),
              lineHeight: 1.5,
            }}
          >
            Name the session and choose the workout type.
          </p>
        </section>

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
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
              color: colors.text,
              fontSize: s(fontSizes.caption, scale),
            }}
          >
            <SectionDivider label="Workout name" />
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
                background: colors.componentsBg,
                color: colors.text,
                fontSize: Math.max(s(fontSizes.input, scale), 16),
                outline: 'none',
              }}
            />
          </label>

          <div>
            <SectionDivider label="Workout type" />

            {workoutTypes.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 44 * 5,
                  borderRadius: s(18, scale),
                  border: `1px solid ${colors.border}`,
                  background: colors.componentsBg,
                }}
              >
                <LoadingCircle size={18} />
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <WheelPicker
                  width="100%"
                  items={workoutTypes.map((t) => t.label)}
                  value={selectedTypeIndex}
                  onChange={setSelectedTypeIndex}
                  visibleRows={5}
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleCreateWorkout}
            disabled={isSaving}
            width="3/4"
            align="center"
          >
            {isSaving ? 'Creating...' : 'Create'}
          </Button>
        </section>
      </div>
      {showSuccess && (
        <SuccessAnimation
          message="Workout created!"
          onDone={() => {
            setShowSuccess(false);
            if (pendingNavRef.current) {
              router.push(pendingNavRef.current);
            }
          }}
          doneDelay={1500}
        />
      )}
    </main>
  );
}
