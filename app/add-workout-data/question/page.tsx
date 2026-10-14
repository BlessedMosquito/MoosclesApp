'use client';

import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { getWorkoutById } from '@/services/workouts';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'motion/react';

const workoutDataView: Record<WorkoutTypeGroup, string> = {
  DistanceDuration: '/distance-duration',
  DurationOnly: '/distance-duration',
  RepetitionBased: '/repetition-based',
};

function QuestionContent() {
  const { isMobile, scale } = useResponsive();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const workoutId = searchParams.get('workoutId') ?? '';

  const [workoutGroupType, setWorkoutGroupType] =
    useState<WorkoutTypeGroup | null>(null);

  useEffect(() => {
    async function getData() {
      if (!workoutId) return;

      try {
        const workout = await getWorkoutById(workoutId);
        if (workout) {
          setWorkoutGroupType(
            workout.workout_types.workout_group as WorkoutTypeGroup
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.');
      }
    }
    getData();
  }, [workoutId]);

  const goTo = (target: string) => {
    if (!isMobile) {
      router.push(target);
      return;
    }
    setTimeout(() => {
      router.push(target);
    }, 450);
  };

  const handleAddNow = () => {
    const path = workoutGroupType
      ? workoutDataView[workoutGroupType]
      : undefined;

    if (!path) {
      setError('Unsupported workout group.');
      return;
    }

    const params = new URLSearchParams({
      workoutId,
      mode: 'NEW',
    });

    goTo(`/add-workout-data${path}?${params.toString()}`);
  };

  const handleLater = () => {
    goTo('/dashboard');
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '80dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: isMobile ? '100%' : 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: s(22, scale),
        }}
      >
        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0, 0.71, 0.2, 1.01] }}
          style={{
            alignSelf: 'center',
            width: '85%',
            boxSizing: 'border-box',
            padding: s(32, scale),
            borderRadius: s(20, scale),
            border: `1px solid ${colors.text}`,
            background: colors.componentsBg,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: s(16, scale),
          }}
        >
          <h2
            style={{
              margin: 0,
              color: colors.text,
              fontSize: s(fontSizes.heading2, scale),
              fontWeight: 700,
            }}
          >
            Do you want to add data to workout?
          </h2>
          <p
            style={{
              margin: 0,
              color: colors.textMuted,
              fontSize: s(fontSizes.bodySmall, scale),
              lineHeight: 1.5,
            }}
          >
            You can add time, distance, or exercises now, or come back to it
            later.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: s(12, scale),
              width: '100%',
              marginTop: s(4, scale),
            }}
          >
            <Button onClick={handleLater} width="3/4">
              Later
            </Button>
            <Button onClick={handleAddNow} width="3/4">
              Add now
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AddDataQuestionPage() {
  return (
    <Suspense fallback={null}>
      <QuestionContent />
    </Suspense>
  );
}
