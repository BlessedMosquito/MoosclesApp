'use client'

import BackButton from "@/components/ui/BackButton";
import DistanceInputTile from "@/components/ui/DistanceInputTile";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionDivider from "@/components/ui/SectionDivider";
import SuccessAnimation from "@/components/ui/SuccessAnimation";
import TimeInputTile from "@/components/ui/TimeInputTile";
import WheelPicker from "@/components/ui/WheelPicker";
import { s, useResponsive } from "@/lib/useResponsive";
import { upsertWorkoutMetrics } from "@/services/workoutMetrics";
import { WorkoutTypeGroup } from "@/services/workoutTypes";
import { colors } from "@/theme/colors";
import { fontSizes } from "@/theme/typography";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import { useRef, useState } from "react";

export default function AddWorkoutDataDuration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const workoutId = searchParams.get('workoutId');
  const workoutName = searchParams.get('name') ?? 'Workout';
  const workoutType = searchParams.get('type') ?? 'workout';
  const from = searchParams.get('from');
  const calendarYear = searchParams.get('year');
  const calendarMonth = searchParams.get('month');
  const workoutTypeGroup = searchParams.get('group') as WorkoutTypeGroup;
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

  function handleBack() {
    if (from === 'calendar') {
      const calendarParams = new URLSearchParams();
      if (calendarYear) calendarParams.set('year', calendarYear);
      if (calendarMonth) calendarParams.set('month', calendarMonth);
      if (workoutId) calendarParams.set('workoutId', workoutId);
      router.push(`/calendar?${calendarParams.toString()}`);
      return;
    }
    router.push('/add-workout');
  }

  async function handleAddTime() {
    setError(null);

    if (!workoutId) {
      setError('Missing workout id.');
      return;
    }

    if (time <= 0) {
      setError('Time must be bigger than 0s.');
      return;
    }

    setIsSaving(true);

    try {
      await upsertWorkoutMetrics({
        workoutId: workoutId,
        durationSeconds: time,
      });

      pendingNavRef.current = workoutTypeGroup === 'DistanceDuration'
        ? `/distance?workoutId=${workoutId}`
        : `/dashboard`;
      setShowSuccess(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not add time to workout.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main style={{
      minHeight: '100dvh',
      background: colors.background,
      padding: s(isMobile ? 18 : 28, scale),
      color: colors.text,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: contentMaxWidth }}>
        <BackButton onClick={handleBack} />

        <section style={{ marginTop: s(28, scale) }}>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: s(fontSizes.caption, scale) }}>
            {workoutTypeGroup === 'DistanceDuration' ? 'Step 2 of 3' : 'Step 2 of 2'}
          </p>
          <h1 style={{
            margin: `${s(8, scale)}px 0 0`,
            fontSize: s(isMobile ? fontSizes.heading1 : fontSizes.display, scale),
            fontWeight: 700,
          }}>
            {workoutName}
          </h1>
          <p style={{
            margin: `${s(10, scale)}px 0 0`,
            color: colors.textSecondary,
            fontSize: s(fontSizes.body, scale),
            lineHeight: 1.5,
          }}>
            Add data to your {workoutType} session.
          </p>
        </section>

        {error && (
          <div role="alert" style={{
            marginTop: s(18, scale),
            padding: s(12, scale),
            borderRadius: s(12, scale),
            border: `1px solid ${colors.errorBorder}`,
            background: colors.errorSurface,
            color: colors.errorMuted,
            fontSize: s(fontSizes.bodySmall, scale),
          }}>
            {error}
          </div>
        )}

        <SectionDivider label='Time'/>
        <TimeInputTile 
            label=""
            inputHours={hours}
            inputMinutes={minutes}
            inputSeconds={seconds}
            onChange={setTime}
        />
        <SectionDivider label='Distance'/>
        <DistanceInputTile
            label=""
            valueMeters={distance}
            onChange={setDistance}
        />
        <div style={{ marginTop: s(24, scale) }}>
          <PrimaryButton
            onClick={handleAddTime}
            disabled={isSaving}
            width="3/4"
            align="center"
          >
            {isSaving ? 'Adding...' : 'Add'}
          </PrimaryButton>
        </div>
      </div>

      {showSuccess && (
        <SuccessAnimation
          message="Time added!"
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