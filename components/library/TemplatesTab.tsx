'use client';

import { createElement, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';
import { cn } from '@/lib/utils';
import { getWorkoutTypeIcon } from '@/lib/workoutTypeIcon';
import {
  deleteTemplate,
  getTemplates,
  WorkoutTemplate,
} from '@/services/workoutTemplates';

export default function TemplatesTab() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkoutTemplate[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WorkoutTemplate | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getTemplates()
      .then((data) => {
        if (!cancelled) setTemplates(data);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setTemplates([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load templates.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(template: WorkoutTemplate) {
    setPendingDelete(null);
    setDeletingId(template.id);
    try {
      await deleteTemplate(template.id);
      setTemplates((current) =>
        current ? current.filter((item) => item.id !== template.id) : current
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete template.'
      );
    } finally {
      setDeletingId(null);
    }
  }

  function openEditor(template: WorkoutTemplate) {
    router.push(`/templates/edit?templateId=${template.id}`);
  }

  return (
    <div className="library-section">
      {error && <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>}

      <Button
        width="full"
        variant="secondary"
        onClick={() => router.push('/templates/new')}
      >
        <IconPlus size={18} stroke={2.25} />
        New template
      </Button>

      {!templates ? (
        <div className="library-empty">
          <LoadingCircle />
        </div>
      ) : templates.length === 0 ? (
        <div className="library-empty">
          <p className="muted-text">
            Save your favourite strength workouts as templates to start them in
            one tap.
          </p>
        </div>
      ) : (
        <ul className="library-list">
          {templates.map((template, index) => {
            const count = template.workout_template_exercises.length;
            const preview = template.workout_template_exercises
              .slice(0, 3)
              .map((exercise) => exercise.name)
              .join(', ');

            return (
              <motion.li
                key={template.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(index, 10) * 0.03,
                }}
                className="library-card library-card-split"
              >
                <button
                  type="button"
                  onClick={() => openEditor(template)}
                  className="library-card-main"
                >
                  <span className="library-card-icon">
                    {createElement(
                      getWorkoutTypeIcon(
                        template.workout_types?.name ?? '',
                        template.workout_types?.workout_group
                      ),
                      { size: 20, stroke: 1.75 }
                    )}
                  </span>
                  <span className="library-card-text">
                    <span className="library-card-title">{template.name}</span>
                    <span
                      className={cn(
                        'library-card-meta',
                        count === 0 && 'template-card-empty'
                      )}
                    >
                      {count === 0
                        ? 'No exercises'
                        : `${count} ${count === 1 ? 'exercise' : 'exercises'} · ${preview}${count > 3 ? '…' : ''}`}
                    </span>
                  </span>
                </button>
                <div className="library-card-actions">
                  <button
                    type="button"
                    aria-label={`Edit ${template.name}`}
                    onClick={() => openEditor(template)}
                    className="library-icon-btn"
                  >
                    <IconPencil size={18} stroke={1.75} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${template.name}`}
                    disabled={deletingId !== null}
                    onClick={() => setPendingDelete(template)}
                    className="library-icon-btn library-icon-btn-danger"
                  >
                    {deletingId === template.id ? (
                      <LoadingCircle size={16} />
                    ) : (
                      <IconTrash size={18} stroke={1.75} />
                    )}
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      {pendingDelete && (
        <QuestionPopUp
          title="Delete template?"
          text={`"${pendingDelete.name}" will be removed. Workouts already created from it stay untouched.`}
          noLabel="Cancel"
          yesLabel="Delete"
          onNo={() => setPendingDelete(null)}
          onYes={() => handleDelete(pendingDelete)}
        />
      )}
    </div>
  );
}
