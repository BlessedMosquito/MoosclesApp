'use client';

import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import StackPicker from '@/components/ui/stackPicker/StackPicker';
import { s, useResponsive } from '@/lib/useResponsive';
import { getWorkoutTypes, ReturnGetWorkoutTypeData } from '@/services/workoutTypes';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSetBackRoute, useSetText, useStartLeave } from '../layout';

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
            gap: s(32, scale),
            paddingTop: s(50, scale),
          }}
        >
          <StackPicker
            options={
              workoutsTypes?.map((type, index) => ({
                value: String(index),
                label: type.name,
              })) ?? []
            }
            value={String(selectedTypeIndex)}
            onChange={(value) => {
              setSelectedTypeIndex(Number(value));
            }}
          />

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
