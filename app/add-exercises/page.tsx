'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { s, useResponsive } from '@/lib/useResponsive';
import { addExercise } from '@/services/exercises';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

export default function AddExercisesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const workoutId = Number(searchParams.get('workoutId'));
  const workoutName = searchParams.get('name') ?? 'Workout';
  const workoutType = searchParams.get('type') ?? 'workout';

  const [exerciseName, setExerciseName] = useState('');
  const [exercises, setExercises] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  async function handleAddExercise() {
    setError(null);
    const trimmedExerciseName = exerciseName.trim();

    if (!workoutId) {
      setError('Missing workout id.');
      return;
    }

    if (!trimmedExerciseName) {
      setError('Exercise name is required.');
      return;
    }

    setIsSaving(true);

    try {
      await addExercise({
        workoutId,
        name: trimmedExerciseName,
        order: exercises.length + 1,
      });

      setExercises((currentExercises) => [
        ...currentExercises,
        trimmedExerciseName,
      ]);
      setExerciseName('');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not add exercise.'
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
        <BackButton onClick={() => router.push('/add-workout')} />

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
            Step 2 of 2
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
            {workoutName}
          </h1>

          <p
            style={{
              margin: `${s(10, scale)}px 0 0`,
              color: colors.textSecondary,
              fontSize: s(fontSizes.bodySmall, scale),
              lineHeight: 1.5,
            }}
          >
            Add exercises to your {workoutType} session.
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
            gap: s(16, scale),
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: s(10, scale),
            }}
          >
            <input
              placeholder="Exercise name"
              value={exerciseName}
              onChange={(event) => setExerciseName(event.target.value)}
              style={{
                minWidth: 0,
                flex: 1,
                padding: s(14, scale),
                borderRadius: s(14, scale),
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.text,
                fontSize: s(fontSizes.input, scale),
                outline: 'none',
              }}
            />

            <PrimaryButton
              onClick={handleAddExercise}
              disabled={isSaving}
              height={50}
            >
              Add
            </PrimaryButton>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: s(10, scale),
            }}
          >
            {exercises.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  color: colors.textMuted,
                  fontSize: s(fontSizes.bodySmall, scale),
                }}
              >
                No exercises added yet.
              </p>
            ) : (
              exercises.map((exercise, index) => (
                <div
                  key={`${exercise}-${index}`}
                  style={{
                    padding: s(14, scale),
                    borderRadius: s(14, scale),
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.text,
                    fontSize: s(fontSizes.bodySmall, scale),
                  }}
                >
                  {index + 1}. {exercise}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
