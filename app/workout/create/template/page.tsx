'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { IconPlus } from '@tabler/icons-react';
import BackButton from '@/components/ui/buttons/BackButton';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import SuccessAnimation from '@/components/ui/feedback/SuccessAnimation';
import QuestionPopUp from '@/components/ui/popups/QuestionPopUp';
import TopBar from '@/components/ui/topBar/TopBar';
import { createClient } from '@/lib/supabase/client';
import { getWorkoutTypeIcon } from '@/lib/workoutTypeIcon';
import {
  createWorkoutFromTemplate,
  getTemplates,
  WorkoutTemplate,
} from '@/services/workoutTemplates';
import { cn } from '@/lib/utils';
import { Mode } from '@/types/common';
import { spring } from '@/lib/motion';

function isEmptyTemplate(template: WorkoutTemplate) {
  return template.workout_template_exercises.length === 0;
}

function describeTemplate(template: WorkoutTemplate) {
  const count = template.workout_template_exercises.length;
  const parts = [template.workout_types?.name];
  if (count > 0)
    parts.push(`${count} ${count === 1 ? 'exercise' : 'exercises'}`);
  else if (isEmptyTemplate(template)) parts.push('No exercises');
  return parts.filter(Boolean).join(' · ');
}

export default function ChooseTemplatePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkoutTemplate[] | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [pendingTemplate, setPendingTemplate] =
    useState<WorkoutTemplate | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingNavRef = useRef<string | null>(null);

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

  async function startFromTemplate(template: WorkoutTemplate) {
    if (creatingId) return;

    setCreatingId(template.id);
    setError(null);

    try {
      const {
        data: { user },
      } = await createClient().auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        setCreatingId(null);
        return;
      }

      const workout = await createWorkoutFromTemplate({
        userId: user.id,
        template,
        date: new Date(),
      });

      const params = new URLSearchParams({
        workoutId: String(workout.id),
        mode: 'NEW' as Mode,
      });
      pendingNavRef.current = `/add-workout-data/repetition-based?${params.toString()}`;
      setShowSuccess(true);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Could not create workout.'
      );
      setCreatingId(null);
    }
  }

  return (
    <main className="page page-padded">
      <div className="page-content page-content-narrow">
        <TopBar
          left={<BackButton onClick={() => router.push('/workout/create')} />}
          center="Choose template"
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        {templates === null ? (
          <div className="template-empty">
            <LoadingCircle />
          </div>
        ) : templates.length === 0 ? (
          <div className="template-empty">
            <p className="muted-text">You don&apos;t have any templates yet.</p>
          </div>
        ) : (
          <div className="template-list">
            {templates.map((template, index) => {
              const TypeIcon = getWorkoutTypeIcon(
                template.workout_types?.name ?? '',
                template.workout_types?.workout_group
              );
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: Math.min(index, 10) * 0.03 }}
                  className="template-card"
                >
                  <button
                    type="button"
                    disabled={creatingId !== null}
                    onClick={() => setPendingTemplate(template)}
                    className="template-card-main pressable"
                  >
                    <span className="template-card-icon">
                      {creatingId === template.id ? (
                        <LoadingCircle size={20} />
                      ) : (
                        <TypeIcon size={22} stroke={1.75} />
                      )}
                    </span>
                    <span className="template-card-text">
                      <span className="template-card-title">
                        {template.name}
                      </span>
                      <span
                        className={cn(
                          'template-card-meta',
                          isEmptyTemplate(template) && 'template-card-empty'
                        )}
                      >
                        {describeTemplate(template)}
                      </span>
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <Button
            width="full"
            variant="secondary"
            onClick={() => router.push('/templates/new')}
          >
            <IconPlus size={18} stroke={2.25} />
            New template
          </Button>
        </div>
      </div>

      {pendingTemplate && (
        <QuestionPopUp
          title="Start workout?"
          text={`Create a workout for today from "${pendingTemplate.name}"?`}
          warning={
            isEmptyTemplate(pendingTemplate)
              ? 'This template has no exercises. The workout will be created empty and you will need to add exercises yourself.'
              : undefined
          }
          noLabel="Cancel"
          yesLabel="Create"
          onNo={() => setPendingTemplate(null)}
          onYes={() => {
            const template = pendingTemplate;
            setPendingTemplate(null);
            startFromTemplate(template);
          }}
        />
      )}

      {showSuccess && (
        <SuccessAnimation
          message="Workout created!"
          doneDelay={1200}
          onDone={() => {
            setShowSuccess(false);
            if (pendingNavRef.current) router.replace(pendingNavRef.current);
          }}
        />
      )}
    </main>
  );
}
