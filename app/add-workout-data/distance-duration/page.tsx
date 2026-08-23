'use client';

import Button from '@/components/ui/Button';
import DistanceInput from '@/components/ui/inputs/DistanceInput';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import SectionDivider from '@/components/ui/SectionDivider';
import SuccessAnimation from '@/components/ui/feedback/SuccessAnimation';
import TimeInput from '@/components/ui/inputs/TimeInput';
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
import { createClient } from '@/lib/supabase/client';

export default function AddWorkoutDataDuration() {
  const supabase = createClient();
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
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
  });
  const [distance, setDistance] = useState({
    km: 0,
    m: 0,
  });

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  function validateTime(time: { hours: number; minutes: number }) {
    setError(null);

    const totalMinutes = time.hours * 60 + time.minutes;

    if (isNaN(totalMinutes)) {
      setError('Time must be a number.');
      return false;
    }

    if (totalMinutes <= 0) {
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
        const formatedTime = formatDuration(data.duration_minutes);
        setTime({
          hours: formatedTime.h,
          minutes: formatedTime.m,
        });
        const formatedDistance = formatDistance(data.distance_meters);
        setDistance(formatedDistance);
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

    const durationMinutes = time.hours * 60 + time.minutes;
    const distanceMeters = distance.km * 1000 + distance.m;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated.');
        return;
      }
      await upsertWorkoutMetrics({
        workoutId: workoutId,
        distanceMeters: distanceMeters,
        durationMinutes,
        wellBeing: 0,
        userId: user.id,
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
            {workoutName}
          </h1>
          <p
            style={{
              margin: `${s(10, scale)}px 0 0`,
              color: colors.text,
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
        <TimeInput
          hours={time.hours}
          minutes={time.minutes}
          onChange={setTime}
          disabled={false}
        />
        <SectionDivider label="Distance" />
        <DistanceInput
          value={distance}
          disabled={false}
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
