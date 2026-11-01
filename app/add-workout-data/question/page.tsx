'use client';

import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
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
    router.replace(target);
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
    <div className="question-page">
      <div className="wizard-form">
        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0, 0.71, 0.2, 1.01] }}
          className="question-panel"
        >
          <h2 className="question-panel-title">
            Do you want to add data to workout?
          </h2>
          <p className="question-panel-text">
            You can add time, distance, or exercises now, or come back to it
            later.
          </p>
          <div className="question-panel-actions">
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
