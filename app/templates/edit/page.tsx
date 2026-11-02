'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import BackButton from '@/components/ui/buttons/BackButton';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';
import TopBar from '@/components/ui/topBar/TopBar';
import {
  EXERCISE_RETURN_PATH_KEY,
  PENDING_EXERCISE_TEMPLATE_ID_KEY,
  PENDING_EXERCISE_WORKOUT_ID_KEY,
} from '@/app/constants/storageConstants';
import {
  deleteTemplate,
  deleteTemplateExercise,
  getTemplateById,
  WorkoutTemplate,
} from '@/services/workoutTemplates';

function EditTemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') ?? '';

  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(
    null
  );
  const [showDeletePopUp, setShowDeletePopUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!templateId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      setError('Missing template id.');
      return;
    }

    getTemplateById(templateId)
      .then((data) => {
        if (cancelled) return;
        setTemplate(data);
        if (!data) setError('Template not found.');
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load template.'
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const exercises = template?.workout_template_exercises ?? [];
  const isRepetitionBased =
    template?.workout_types?.workout_group === 'RepetitionBased';

  function openExercisePicker() {
    window.sessionStorage.removeItem(PENDING_EXERCISE_WORKOUT_ID_KEY);
    window.sessionStorage.setItem(PENDING_EXERCISE_TEMPLATE_ID_KEY, templateId);
    window.sessionStorage.setItem(
      EXERCISE_RETURN_PATH_KEY,
      `/templates/edit?templateId=${templateId}`
    );
    router.push('/add-workout-data/repetition-based/add-exercise');
  }

  async function removeExercise(exerciseId: string) {
    if (deletingExerciseId) return;

    setDeletingExerciseId(exerciseId);
    try {
      await deleteTemplateExercise(exerciseId);
      setTemplate((current) =>
        current
          ? {
              ...current,
              workout_template_exercises:
                current.workout_template_exercises.filter(
                  (exercise) => exercise.id !== exerciseId
                ),
            }
          : current
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete exercise.'
      );
    } finally {
      setDeletingExerciseId(null);
    }
  }

  async function handleDeleteTemplate() {
    setShowDeletePopUp(false);
    setIsDeleting(true);
    try {
      await deleteTemplate(templateId);
      router.replace('/library?tab=templates');
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete template.'
      );
      setIsDeleting(false);
    }
  }

  const subheading = [
    template?.workout_types?.name,
    isRepetitionBased
      ? `${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <main className="page page-padded">
      <div className="page-content page-content-narrow">
        <TopBar
          left={
            <BackButton onClick={() => router.push('/library?tab=templates')} />
          }
          center={template?.name ?? 'Template'}
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        {isLoading ? (
          <div className="template-empty">
            <LoadingCircle />
          </div>
        ) : template ? (
          <>
            <header className="workout-data-header">
              <h2 className="workout-data-heading">
                {isRepetitionBased ? 'Exercises' : 'Template'}
              </h2>
              {subheading && (
                <p className="workout-data-subheading">{subheading}</p>
              )}
            </header>

            {isRepetitionBased ? (
              <>
                {exercises.length === 0 ? (
                  <p className="template-hint">
                    Add exercises that should be created with every workout from
                    this template.
                  </p>
                ) : (
                  <ul className="template-exercises">
                    <AnimatePresence initial={false}>
                      {exercises.map((exercise, index) => (
                        <motion.li
                          key={exercise.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -24 }}
                          transition={{ duration: 0.2 }}
                          className="template-exercise"
                        >
                          <span className="accordion-index">{index + 1}</span>
                          <span className="template-exercise-name">
                            {exercise.name}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${exercise.name}`}
                            disabled={deletingExerciseId !== null}
                            onClick={() => removeExercise(exercise.id)}
                            className="icon-btn set-delete"
                          >
                            {deletingExerciseId === exercise.id ? (
                              <LoadingCircle size={16} />
                            ) : (
                              <IconTrash size={18} stroke={1.75} />
                            )}
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}

                <div className="mt-4">
                  <Button
                    width="full"
                    variant="secondary"
                    onClick={openExercisePicker}
                  >
                    <IconPlus size={18} stroke={2.25} />
                    Add exercise
                  </Button>
                </div>
              </>
            ) : (
              <p className="template-hint">
                Workouts created from this template get its name and type. Add
                the data after the workout.
              </p>
            )}

            <div className="template-actions">
              <Button
                width="full"
                onClick={() => router.push('/library?tab=templates')}
              >
                Done
              </Button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeletePopUp(true)}
                className="accordion-delete"
              >
                {isDeleting ? <LoadingCircle size={16} /> : 'Delete template'}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {showDeletePopUp && (
        <QuestionPopUp
          text="Do you really want to delete this template?"
          onYes={handleDeleteTemplate}
          onNo={() => setShowDeletePopUp(false)}
        />
      )}
    </main>
  );
}

export default function EditTemplatePage() {
  return (
    <Suspense fallback={null}>
      <EditTemplateContent />
    </Suspense>
  );
}
