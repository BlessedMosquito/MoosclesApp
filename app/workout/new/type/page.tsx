'use client';

import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import WheelPicker from '@/components/ui/inputs/WheelPicker';
import { createClient } from '@/lib/supabase/client';
import { s, useResponsive } from '@/lib/useResponsive';
import {
  getWorkoutTypeGroup,
  getWorkoutTypes,
  ReturnGetWorkoutTypeData,
  WorkoutTypeGroup,
} from '@/services/workoutTypes';
import { createWorkout } from '@/services/workouts';
import { Mode } from '@/types/common';
import { useSetBackRoute, useSetText, useStartLeave } from '../layout';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

function TypeContent() {
  const { isMobile, scale } = useResponsive();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subgroup = searchParams.get('subgroup') ?? '';
  const workoutName = searchParams.get('workoutName') ?? '';
  const setBackRoute = useSetBackRoute();
  const setText = useSetText();
  const startLeave = useStartLeave();

  const [workoutsTypes, setWorkoutsTypes] = useState<
    ReturnGetWorkoutTypeData[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);

  const loadWorkoutsTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setWorkoutsTypes(await getWorkoutTypes({ subgroup: subgroup }));
    } catch {
      setError('An error occured');
    } finally {
      setIsLoading(false);
    }
  }, [subgroup]);

  useEffect(() => {
    setBackRoute(
      `/workout/new/name?subgroup=${encodeURIComponent(subgroup)}&workoutName=${encodeURIComponent(workoutName)}`
    );
    setText('Select your workout');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkoutsTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBackRoute, setText, loadWorkoutsTypes]);

  const handleContinue = async () => {
    const type = workoutsTypes?.[selectedTypeIndex];

    if (!type) {
      return;
    }

    try {
      setIsCreating(true);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        return;
      }

      const workout = await createWorkout({
        userId: user.id,
        name: workoutName,
        workoutType: type.id,
        date: new Date(),
      });

      const workoutTypeGroup = await getWorkoutTypeGroup(type.id);

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
        workoutType: type.label,
        name: workoutName,
        mode: 'NEW' as Mode,
      });

      const target = `/add-workout-data${path}?${params.toString()}`;

      if (!isMobile) {
        router.push(target);
        return;
      }
      startLeave();
      setTimeout(() => {
        router.push(target);
      }, 450);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create workout.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isLoading ? (
        <div
          style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LoadingCircle />
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: s(24, scale),
          }}
        >
          <WheelPicker
            width="100%"
            items={workoutsTypes?.map((t) => t.name)}
            value={selectedTypeIndex}
            onChange={setSelectedTypeIndex}
            visibleRows={5}
          />

          <Button
            onClick={handleContinue}
            width="full"
            disabled={!workoutsTypes || workoutsTypes.length === 0 || isCreating}
          >
            Continue
          </Button>
          {error ? (
            <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function TypePage() {
  return (
    <Suspense fallback={null}>
      <TypeContent />
    </Suspense>
  );
}