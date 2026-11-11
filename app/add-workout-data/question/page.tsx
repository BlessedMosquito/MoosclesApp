'use client';

import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { getWorkoutTypeIcon } from '@/lib/workoutTypeIcon';
import { getExercisesByWorkout } from '@/services/exercises';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { getWorkoutById, ReturnGetWorkoutsData } from '@/services/workouts';
import { useRouter, useSearchParams } from 'next/navigation';
import { createElement, Suspense, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { IconArrowRight, IconClock, IconListCheck } from '@tabler/icons-react';
import { spring } from '@/lib/motion';

const workoutDataView: Record<WorkoutTypeGroup, string> = {
  DistanceDuration: '/distance-duration',
  DurationOnly: '/distance-duration',
  RepetitionBased: '/repetition-based',
};

function getCopy(group: WorkoutTypeGroup, exerciseCount: number) {
  if (group === 'RepetitionBased') {
    if (exerciseCount > 0) {
      return {
        title: 'Log your sets now?',
        text: `${exerciseCount} ${exerciseCount === 1 ? 'exercise is' : 'exercises are'} ready. Add sets as you train, or come back to it later.`,
        action: 'Log sets',
      };
    }
    return {
      title: 'Add exercises now?',
      text: 'Pick the exercises for this workout and log your sets, or come back to it later.',
      action: 'Add exercises',
    };
  }
  return {
    title:
      group === 'DurationOnly' ? 'Log your time now?' : 'Log distance & time?',
    text: 'Fill in your results now, or come back to it later from the calendar.',
    action: 'Add results',
  };
}

function formatWorkoutDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function QuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [workout, setWorkout] = useState<ReturnGetWorkoutsData | null>(null);
  const [exerciseCount, setExerciseCount] = useState(0);

  const workoutId = searchParams.get('workoutId') ?? '';

  useEffect(() => {
    async function getData() {
      if (!workoutId) return;

      try {
        const data = await getWorkoutById(workoutId);
        if (!data) {
          setError('Workout not found.');
          return;
        }
        if (data.workout_types.workout_group === 'RepetitionBased') {
          const exercises = await getExercisesByWorkout(workoutId);
          setExerciseCount(exercises.length);
        }
        setWorkout(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.');
      }
    }
    getData();
  }, [workoutId]);

  const group = workout?.workout_types.workout_group as
    | WorkoutTypeGroup
    | undefined;

  const handleAddNow = () => {
    const path = group ? workoutDataView[group] : undefined;

    if (!path) {
      setError('Unsupported workout group.');
      return;
    }

    const params = new URLSearchParams({
      workoutId,
      mode: 'NEW',
    });

    router.replace(`/add-workout-data${path}?${params.toString()}`);
  };

  const handleLater = () => {
    router.replace('/dashboard');
  };

  if (!workout || !group) {
    return (
      <div className="question-page">
        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}
        {error ? (
          <Button onClick={handleLater} variant="secondary" width="1/2">
            Go to dashboard
          </Button>
        ) : (
          <LoadingCircle />
        )}
      </div>
    );
  }

  const copy = getCopy(group, exerciseCount);
  const HintIcon = group === 'RepetitionBased' ? IconListCheck : IconClock;

  return (
    <div className="question-page">
      {error && <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="question-panel"
      >
        <div className="question-workout">
          <span className="question-workout-icon">
            {createElement(
              getWorkoutTypeIcon(workout.workout_types.name, group),
              { size: 24, stroke: 1.75 }
            )}
          </span>
          <span className="question-workout-text">
            <span className="question-workout-name">{workout.name}</span>
            <span className="question-workout-meta">
              {workout.workout_types.name} ·{' '}
              {formatWorkoutDate(workout.workout_date)}
            </span>
          </span>
        </div>

        <div className="question-panel-copy">
          <span className="question-panel-badge">
            <HintIcon size={16} stroke={2} />
            Workout created
          </span>
          <h1 className="question-panel-title">{copy.title}</h1>
          <p className="question-panel-text">{copy.text}</p>
        </div>

        <div className="question-panel-actions">
          <Button onClick={handleAddNow} width="full">
            {copy.action}
            <IconArrowRight size={18} stroke={2.25} />
          </Button>
          <Button onClick={handleLater} variant="secondary" width="full">
            Later
          </Button>
        </div>
      </motion.div>
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
