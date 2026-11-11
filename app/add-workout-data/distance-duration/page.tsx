'use client';

import { getSafeInternalPath } from '@/lib/utils';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import { useToast } from '@/lib/toast-context';
import SaveIcon from '@/components/icons/SaveIcon';
import { formatDistance, formatDuration } from '@/lib/format';
import {
  getWorkoutMetrics,
  upsertWorkoutMetrics,
} from '@/services/workoutMetrics';
import { deleteWorkout, getWorkoutById } from '@/services/workouts';
import { WorkoutTypeGroup } from '@/services/workoutTypes';
import { Mode } from '@/types/common';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Slider from '@/components/ui/slider/Slider';
import { iconBasedOnRange } from '@/lib/helpers';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import BackButton from '@/components/ui/buttons/BackButton';
import TopBar from '@/components/ui/topBar/TopBar';
import TextInput from '@/components/ui/inputs/TextInput';
import TimeInput from '@/components/ui/inputs/TimeInput';
import DistanceInput from '@/components/ui/inputs/DistanceInput';
import PopupWindow from '@/components/ui/popups/PopUpWindow';
import CompletedSection from '@/components/ui/CompletedSection';
import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';

export default function AddWorkoutDataDuration() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const workoutId = searchParams.get('workoutId');
  const mode = searchParams.get('mode') as Mode;
  const returnTo = getSafeInternalPath(searchParams.get('returnTo'));
  const { showSuccess } = useToast();

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [workoutName, setWorkoutName] = useState('Workout');
  const [workoutType, setWorkoutType] = useState('');
  const [workoutGroupType, setWorkoutGroupType] =
    useState<WorkoutTypeGroup | null>(null);
  const [timeText, setTimeText] = useState('');
  const [distanceText, setDistanceText] = useState('');
  const [wellBeing, setWellBeing] = useState(5);
  const [timePopupOpen, setTimePopupOpen] = useState(false);
  const [distancePopupOpen, setDistancePopupOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeletePopUp, setShowDeletePopUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPreview = mode === 'PREVIEW';
  const canEdit = mode === 'EDIT' || mode === 'NEW' || isEditing;

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
      meters: Math.min(999, Math.max(0, Math.floor(Number(m) || 0))),
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
        setIsCompleted(workout.completed_at !== null);
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

    if (!canEdit || isCompleted) {
      return false;
    }

    if (!workoutId) {
      setError('Missing workout id.');
      return false;
    }

    const { hours, minutes } = parseTimeText(timeText);

    if (!validateTime(hours * 60 + minutes)) {
      return false;
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
        return false;
      }
      await upsertWorkoutMetrics({
        workoutId: workoutId,
        distanceMeters: distanceMeters,
        durationMinutes,
        wellBeing: wellBeing,
        userId: user.id,
      });

      showSuccess('Results saved');
      if (mode === 'EDIT') leave('/library');
      else if (!isPreview) router.push('/dashboard');
      return true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not add time to workout.'
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  function leave(fallback: string) {
    if (returnTo) router.replace(returnTo);
    else if (window.history.length > 1) router.back();
    else router.replace(fallback);
  }

  function renderButton() {
    const onClick = async () => {
      const saved = await handleAddWorkoutData();
      if (saved && isEditing) setIsEditing(false);
    };
    return (
      <Button
        onClick={onClick}
        disabled={isSaving || isCompleted}
        width="full"
        align="center"
      >
        {isSaving ? (
          <LoadingCircle size={18} />
        ) : (
          <>
            <SaveIcon />
            Save
          </>
        )}
      </Button>
    );
  }

  async function handleDeleteWorkout() {
    if (!workoutId || isCompleted) return;

    setShowDeletePopUp(false);
    setIsDeleting(true);
    setError(null);

    try {
      await deleteWorkout(workoutId);
      if (window.history.length > 1) {
        router.back();
      } else {
        router.replace('/library');
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete workout.'
      );
      setIsDeleting(false);
    }
  }

  function renderPreviewActions() {
    return (
      <div className="workout-data-buttons">
        <Button
          onClick={() => setIsEditing(true)}
          disabled={isDeleting}
          width="full"
        >
          Edit
        </Button>
        <Button
          onClick={() => setShowDeletePopUp(true)}
          disabled={isDeleting}
          width="full"
          variant="danger"
        >
          {isDeleting ? <LoadingCircle size={18} /> : 'Delete'}
        </Button>
      </div>
    );
  }

  function renderActions() {
    if (isCompleted) return <CompletedSection />;
    if (isPreview && !isEditing) return renderPreviewActions();
    if (canEdit) return renderButton();
    return null;
  }

  return (
    <main className="page-section">
      <div className="page-content page-content-narrow">
        <TopBar
          left={<BackButton onClick={() => leave('/library')} />}
          center={workoutName}
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <div className="workout-data-fields">
          {workoutType && (
            <div className="field">
              <span className="field-label field-label-lg">Workout type</span>
              <TextInput value={workoutType} readOnly onChange={() => {}} />
            </div>
          )}

          <div className="field">
            <span className="field-label field-label-lg">Time</span>
            {isEditing ? (
              <TimeInput
                hours={parseTimeText(timeText).hours}
                minutes={parseTimeText(timeText).minutes}
                disabled={false}
                onChange={({ hours, minutes }) =>
                  setTimeText(`${hours}:${String(minutes).padStart(2, '0')}`)
                }
              />
            ) : canEdit && timeText === '' ? (
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
            <div className="field">
              <span className="field-label field-label-lg">Distance</span>
              {isEditing ? (
                <DistanceInput
                  value={{
                    km: parseDistanceText(distanceText).kilometers,
                    m: parseDistanceText(distanceText).meters,
                  }}
                  disabled={false}
                  onChange={({ km, m }) =>
                    setDistanceText(`${km}:${String(m).padStart(2, '0')}`)
                  }
                />
              ) : canEdit && distanceText === '' ? (
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

          <div className="field">
            <span className="field-label field-label-lg">Well-being</span>
            <div className="workout-data-slider">
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
                blockSlider={!canEdit || isCompleted}
              />
            </div>
          </div>
        </div>

        <div className="workout-data-actions">{renderActions()}</div>
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

      {showDeletePopUp && (
        <QuestionPopUp
          title="Delete workout?"
          text="This can't be undone."
          noLabel="Cancel"
          yesLabel="Delete"
          tone="danger"
          onYes={handleDeleteWorkout}
          onNo={() => setShowDeletePopUp(false)}
        />
      )}
    </main>
  );
}
