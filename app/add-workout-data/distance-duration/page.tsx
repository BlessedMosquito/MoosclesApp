'use client';

import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import SuccessAnimation from '@/components/ui/feedback/SuccessAnimation';
import { formatDistance, formatDuration } from '@/lib/format';
import { s, useResponsive } from '@/lib/useResponsive';
import {
  getWorkoutMetrics,
  upsertWorkoutMetrics,
} from '@/services/workoutMetrics';
import { getWorkoutById } from '@/services/workouts';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { Mode } from '@/types/common';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createClient } from '@/lib/supabase/client';
import Slider from '@/components/ui/slider/Slider';
import { iconBasedOnRange } from '@/lib/helpers';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import ChevronIcon from '@/components/icons/ChevronIcon';
import TopBar from '@/components/ui/topBar/TopBar';
import TextInput from '@/components/ui/inputs/TextInput';
import PopupWindow from '@/components/ui/popups/PopUpWindow';

export default function AddWorkoutDataDuration() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const workoutId = searchParams.get('workoutId');
  const mode = searchParams.get('mode') as Mode;
  const pendingNavRef = useRef<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [workoutName, setWorkoutName] = useState('Workout');
  const [workoutType, setWorkoutType] = useState('');
  const [workoutGroupType, setWorkoutGroupType] =
    useState<WorkoutTypeGroup | null>(null);
  const [timeText, setTimeText] = useState('');
  const [distanceText, setDistanceText] = useState('');
  const [wellBeing, setWellBeing] = useState(5);
  const [timePopupOpen, setTimePopupOpen] = useState(false);
  const [distancePopupOpen, setDistancePopupOpen] = useState(false);

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  const isPreview = mode === 'PREVIEW';
  const canEdit = mode === 'EDIT' || mode === 'NEW';

  const fieldStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: s(8, scale),
    width: '100%',
  };

  const labelStyle: CSSProperties = {
    fontSize: s(fontSizes.heading2, scale),
    fontWeight: 600,
    color: colors.text,
  };

  function parseTimeText(text: string) {
    const [h = '', m = ''] = text.split(':');
    return {
      hours: Math.max(0, Math.floor(Number(h) || 0)),
      minutes: Math.min(59, Math.max(0, Math.floor(Number(m) || 0))),
    };
  }

  function parseDistanceText(text: string) {
    const [km = '', m = ''] = text.split(':');
    return {
      kilometers: Math.max(0, Math.floor(Number(km) || 0)),
      meters: Math.min(99, Math.max(0, Math.floor(Number(m) || 0))),
    };
  }

  function maskColonInput(raw: string) {
    const cleaned = raw.replace(/[^0-9:]/g, '');
    const parts = cleaned.split(':');
    const head = parts[0].slice(0, 3);
    if (parts.length === 1) {
      return head;
    }
    return `${head}:${parts.slice(1).join('').slice(0, 2)}`;
  }

  function normalizeTime(text: string) {
    if (text === '') return '';
    const { hours, minutes } = parseTimeText(text);
    return `${hours}:${String(minutes).padStart(2, '0')}`;
  }

  function normalizeDistance(text: string) {
    if (text === '') return '';
    const { kilometers, meters } = parseDistanceText(text);
    return `${kilometers}:${String(meters).padStart(2, '0')}`;
  }

  function validateTime(totalMinutes: number) {
    setError(null);

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
      if (!workoutId) {
        setError('Something went wrong.');
        return;
      }

      const workout = await getWorkoutById(workoutId);
      if (workout) {
        setWorkoutName(workout.name);
        setWorkoutType(
          workout.workout_types.name
            ? workout.workout_types.name.charAt(0).toUpperCase() +
                workout.workout_types.name.slice(1)
            : ''
        );
        setWorkoutGroupType(
          workout.workout_types.workout_group as WorkoutTypeGroup
        );
      }

      if (mode === 'NEW') {
        return;
      }

      const data = await getWorkoutMetrics(workoutId);
      if (data) {
        const formatedTime = formatDuration(data.duration_minutes);
        setTimeText(
          `${formatedTime.h}:${String(formatedTime.m).padStart(2, '0')}`
        );
        const formatedDistance = formatDistance(data.distance_meters);
        setDistanceText(
          `${Math.floor(formatedDistance.km)}:${String(
            formatedDistance.m
          ).padStart(2, '0')}`
        );
        setWellBeing(data.well_being ?? 5);
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

    const { hours, minutes } = parseTimeText(timeText);

    if (!validateTime(hours * 60 + minutes)) {
      return;
    }

    setIsSaving(true);

    const durationMinutes = hours * 60 + minutes;
    const { kilometers, meters } = parseDistanceText(distanceText);
    const distanceMeters = kilometers * 1000 + meters;

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
        wellBeing: wellBeing,
        userId: user.id,
      });

      pendingNavRef.current = '/dashboard';
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

  function renderButton() {
    return (
      <Button
        onClick={handleAddWorkoutData}
        disabled={isSaving}
        width="3/4"
        align="center"
      >
        {isSaving ? <LoadingCircle size={18} /> : 'Save'}
      </Button>
    );
  }

  return (
    <main
      style={{
        background: 'transparent',
        padding: s(isMobile ? 18 : 28, scale),
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: contentMaxWidth }}>
        <TopBar
          left={
            <button
              style={{
                rotate: '-180deg',
                cursor: 'pointer',
              }}
              onClick={() =>
                mode === 'PREVIEW' ? router.back() : router.push('/calendar')
              }
            >
              <ChevronIcon />
            </button>
          }
          center={workoutName}
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <div
          style={{
            marginTop: s(24, scale),
            display: 'flex',
            flexDirection: 'column',
            gap: s(20, scale),
          }}
        >
          {workoutType && (
            <div style={fieldStyle}>
              <span style={labelStyle}>Workout type</span>
              <TextInput value={workoutType} readOnly onChange={() => {}} />
            </div>
          )}

          <div style={fieldStyle}>
            <span style={labelStyle}>Time</span>
            {canEdit && timeText === '' ? (
              <Button onClick={() => setTimePopupOpen(true)}>Add time</Button>
            ) : (
              <TextInput
                value={timeText}
                onChange={(value) => setTimeText(maskColonInput(value))}
                onBlur={() => setTimeText((value) => normalizeTime(value))}
                placeholder="hh:mm"
                inputMode="numeric"
                disabled={isPreview}
              />
            )}
          </div>

          {workoutGroupType === 'DistanceDuration' && (
            <div style={fieldStyle}>
              <span style={labelStyle}>Distance</span>
              {canEdit && distanceText === '' ? (
                <Button onClick={() => setDistancePopupOpen(true)}>
                  Add distance
                </Button>
              ) : (
                <TextInput
                  value={distanceText}
                  onChange={(value) => setDistanceText(maskColonInput(value))}
                  onBlur={() =>
                    setDistanceText((value) => normalizeDistance(value))
                  }
                  placeholder="km:mm"
                  inputMode="numeric"
                  disabled={isPreview}
                />
              )}
            </div>
          )}

          <div style={fieldStyle}>
            <span style={labelStyle}>Well-being</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: s(8, scale),
                width: '100%',
              }}
            >
              <Slider
                label={iconBasedOnRange({
                  value: wellBeing,
                  min: 1,
                  max: 10,
                })}
                value={wellBeing}
                min={1}
                max={10}
                onChange={setWellBeing}
                blockSlider={mode === 'PREVIEW'}
              />
            </div>
          </div>
        </div>

        {isPreview && (
          <div style={{ marginTop: s(100, scale) }}>{renderButton()}</div>
        )}
      </div>

      {timePopupOpen && (
        <PopupWindow title="Time" onClose={() => setTimePopupOpen(false)}>
          <TextInput
            value={timeText}
            onChange={(value) => setTimeText(maskColonInput(value))}
            onBlur={() => setTimeText((value) => normalizeTime(value))}
            placeholder="hh:mm"
            inputMode="numeric"
          />
          <Button onClick={() => setTimePopupOpen(false)}>Save</Button>
        </PopupWindow>
      )}

      {distancePopupOpen && (
        <PopupWindow
          title="Distance"
          onClose={() => setDistancePopupOpen(false)}
        >
          <TextInput
            value={distanceText}
            onChange={(value) => setDistanceText(maskColonInput(value))}
            onBlur={() => setDistanceText((value) => normalizeDistance(value))}
            placeholder="km:mm"
            inputMode="numeric"
          />
          <Button onClick={() => setDistancePopupOpen(false)}>Save</Button>
        </PopupWindow>
      )}

      {showSuccess && (
        <SuccessAnimation
          message="Data saved successfully"
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
