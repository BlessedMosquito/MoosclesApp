'use client';

import Button from '@/components/ui/Button';
import DistanceInputTile from '@/components/ui/DistanceInputTile';
import ErrorPopUp from '@/components/ui/ErrorPopUp';
import SectionDivider from '@/components/ui/SectionDivider';
import SuccessAnimation from '@/components/ui/SuccessAnimation';
import TimeInputTile from '@/components/ui/TimeInputTile';
import { formatDistance, formatDuration } from '@/lib/format';
import { s, useResponsive } from '@/lib/useResponsive';
import {
  getWorkoutMetrics,
  upsertWorkoutMetrics,
} from '@/services/workoutMetrics';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { Mode } from '@/types/common';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function AddWorkoutDataDuration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const workoutId = searchParams.get('workoutId');
  const workoutName = searchParams.get('name') ?? 'Workout';
  const workoutGroupType = searchParams.get(
    'workoutGroupType'
  ) as WorkoutTypeGroup;
  const workoutType = searchParams.get('workoutType')?.toLowerCase();
  const mode = searchParams.get('mode') as Mode;
  const pendingNavRef = useRef<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  function validateTime(time: number) {
    setError(null);
    if (isNaN(time)) {
      setError('Time must be a number.');
      return false;
    }
    if (time <= 0) {
      setError('Time must be bigger than 0.');
      return false;
    }
    return true;
  }

  useEffect(() => {
    async function getData() {
      if (mode === 'NEW') {
        return;
      }
      if (!workoutId) {
        setError('Something went wrong.');
        return;
      }
      const data = await getWorkoutMetrics(workoutId);
      if (data) {
        const formatedTime = formatDuration(data.duration_seconds);
        setHours(formatedTime.h);
        setMinutes(formatedTime.m);
        setSeconds(formatedTime.s);
        setDistance(data.distance_meters ?? 0);
      }
    }
    getData();
  }, [mode, workoutId]);

  async function handleAddWorkoutData() {
    setError(null);

    if (!workoutId) {
      setError('Missing workout id.');
      return;
    }

    if (!validateTime(time)) {
      return;
    }

    setIsSaving(true);

    try {
      await upsertWorkoutMetrics({
        workoutId: workoutId,
        durationSeconds: time,
        distanceMeters: distance,
        wellBeing: 0,
      });

      pendingNavRef.current =
        workoutGroupType === 'DistanceDuration'
          ? `/distance?workoutId=${workoutId}`
          : `/dashboard`;
      setShowSuccess(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not add time to workout.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: colors.bg,
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
            {workoutName}
          </h1>
          <p
            style={{
              margin: `${s(10, scale)}px 0 0`,
              color: colors.textSecondary,
              fontSize: s(fontSizes.body, scale),
              lineHeight: 1.5,
            }}
          >
            Add data to your {workoutType} session.
          </p>
        </section>

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <SectionDivider label="Time" />
        <TimeInputTile
          label=""
          inputHours={hours}
          inputMinutes={minutes}
          inputSeconds={seconds}
          onChange={setTime}
        />
        <SectionDivider label="Distance" />
        <DistanceInputTile
          label=""
          valueMeters={distance}
          onChange={setDistance}
        />
        <div style={{ marginTop: s(24, scale) }}>
          <Button
            onClick={handleAddWorkoutData}
            disabled={isSaving}
            width="3/4"
            align="center"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {showSuccess && (
        <SuccessAnimation
          message="Data successfully added!"
          onDone={() => {
            setShowSuccess(false);
            if (pendingNavRef.current) router.push(pendingNavRef.current);
          }}
          doneDelay={1500}
        />
      )}
    </main>
  );
}
