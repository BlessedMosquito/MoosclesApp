'use client';

import Button from '@/components/ui/buttons/Button';
import ChoiceTile from '@/components/ui/tiles/ChoiceTile';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { useResponsive } from '@/lib/useResponsive';
import { getWorkoutTypeIcon } from '@/lib/workoutTypeIcon';
import {
  getWorkoutTypes,
  ReturnGetWorkoutTypeData,
} from '@/services/workoutTypes';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSetBackRoute, useSetText, useStartLeave } from '../layout';

function TypeContent() {
  const { isMobile } = useResponsive();
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
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);

  const loadWorkoutsTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const types = await getWorkoutTypes({
        subgroup,
      });

      setWorkoutsTypes(types);
    } catch {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [subgroup]);

  useEffect(() => {
    setBackRoute(
      `/workout/new/name?subgroup=${encodeURIComponent(
        subgroup
      )}&workoutName=${encodeURIComponent(workoutName)}`
    );

    setText('Select your workout');

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkoutsTypes();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBackRoute, setText, loadWorkoutsTypes]);

  const handleContinue = () => {
    const type = workoutsTypes?.[selectedTypeIndex];

    if (!type) {
      return;
    }

    const target = `/workout/new/preview?subgroup=${encodeURIComponent(
      subgroup
    )}&workoutName=${encodeURIComponent(
      workoutName
    )}&typeId=${encodeURIComponent(type.id)}&typeLabel=${encodeURIComponent(
      type.name
    )}`;

    if (!isMobile) {
      router.push(target);
      return;
    }

    startLeave();

    setTimeout(() => {
      router.push(target);
    }, 450);
  };

  return (
    <div className="wizard-step">
      {isLoading ? (
        <div className="content-center">
          <LoadingCircle />
        </div>
      ) : (
        <div className="wizard-type">
          {workoutsTypes && workoutsTypes.length === 0 ? (
            <p className="muted-text text-center">No workout types found.</p>
          ) : (
            <div className="choice-grid" role="radiogroup">
              {workoutsTypes?.map((type, index) => (
                <ChoiceTile
                  key={type.id}
                  icon={getWorkoutTypeIcon(type.name, type.workout_group)}
                  label={type.name}
                  index={index}
                  selected={index === selectedTypeIndex}
                  onClick={() => setSelectedTypeIndex(index)}
                />
              ))}
            </div>
          )}

          <Button
            onClick={handleContinue}
            width="full"
            disabled={!workoutsTypes || workoutsTypes.length === 0}
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
