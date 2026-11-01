'use client';

import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { ReturnGetExercisesData } from '@/services/exercises';
import { ReturnGetSetsData } from '@/services/sets';
import { Mode } from '@/types/common';
import Button from './buttons/Button';
import BottomDrawer from './drawer/BottomDrawer';
import NumericInput from './inputs/NumericInput';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconChevronDown, IconPlus, IconTrash } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type SetDraft = {
  reps: string;
  weight: string;
};

type ExerciseAccordionProps = {
  exercise: ReturnGetExercisesData;
  index: number;
  isExpanded: boolean;
  exerciseSets: ReturnGetSetsData[];
  setDraft: SetDraft;
  isLoadingSets?: boolean;
  mode: Mode;
  onToggle: (exercise: ReturnGetExercisesData) => void;
  onDraftChange: (
    exerciseId: string,
    field: keyof SetDraft,
    value: string
  ) => void;
  onAddSet: (exercise: ReturnGetExercisesData) => void | Promise<void>;
  onDeleteExercise?: () => void;
  showDeletePopUp?: (setId: string, exerciseId: string) => void;
};

export default function ExerciseAccordion({
  exercise,
  index,
  isExpanded,
  exerciseSets,
  setDraft,
  isLoadingSets,
  mode,
  onToggle,
  onDraftChange,
  onAddSet,
  onDeleteExercise,
  showDeletePopUp,
}: ExerciseAccordionProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const exerciseId = String(exercise.id);

  function handleAddClick() {
    setIsPopupOpen(true);
  }

  async function handleConfirmAdd() {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await onAddSet(exercise);
    } finally {
      setIsAdding(false);
      setIsPopupOpen(false);
    }
  }

  const canEdit = mode !== 'PREVIEW';
  const totalVolume = exerciseSets.reduce(
    (sum, setItem) => sum + Number(setItem.reps) * Number(setItem.weight),
    0
  );

  return (
    <div className={cn('accordion', isExpanded && 'accordion-open')}>
      <button
        type="button"
        onClick={() => onToggle(exercise)}
        aria-expanded={isExpanded}
        className="accordion-toggle"
      >
        <span className="accordion-index">{index + 1}</span>
        <span className="accordion-title">
          <span className="accordion-name">{exercise.name}</span>
          {exerciseSets.length > 0 && (
            <span className="accordion-meta">
              {exerciseSets.length} {exerciseSets.length === 1 ? 'set' : 'sets'}
              {totalVolume > 0 &&
                ` · ${Math.round(totalVolume * 10) / 10} kg volume`}
            </span>
          )}
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="accordion-chevron"
        >
          <IconChevronDown size={20} stroke={2} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="accordion-content">
              {isLoadingSets ? (
                <div className="flex justify-center p-2">
                  <LoadingCircle size={18} />
                </div>
              ) : exerciseSets.length === 0 ? (
                <p className="accordion-empty">No sets yet.</p>
              ) : (
                <div className="set-table">
                  <div className="set-row set-row-head">
                    <span>Set</span>
                    <span>Reps</span>
                    <span>Weight</span>
                    {canEdit && showDeletePopUp && <span />}
                  </div>
                  {exerciseSets.map((setItem, setIndex) => (
                    <div key={setItem.id} className="set-row">
                      <span className="set-number">{setIndex + 1}</span>
                      <span>{setItem.reps}</span>
                      <span>{setItem.weight} kg</span>
                      {canEdit && showDeletePopUp && (
                        <button
                          type="button"
                          aria-label={`Delete set ${setIndex + 1}`}
                          onClick={() =>
                            showDeletePopUp(setItem.id.toString(), exerciseId)
                          }
                          className="icon-btn set-delete"
                        >
                          <IconTrash size={18} stroke={1.75} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {canEdit && (
                <div className="accordion-actions">
                  <Button
                    width="full"
                    variant="secondary"
                    onClick={handleAddClick}
                  >
                    <IconPlus size={18} stroke={2.25} />
                    Add set
                  </Button>
                  {onDeleteExercise && (
                    <button
                      type="button"
                      onClick={onDeleteExercise}
                      className="accordion-delete"
                    >
                      Delete exercise
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomDrawer
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Add data to your set"
      >
        <div className="set-form">
          <NumericInput
            label="Reps"
            value={setDraft.reps}
            min={0}
            max={999}
            decimal={false}
            placeholder="0"
            onChange={(value) =>
              onDraftChange(exerciseId, 'reps', String(value))
            }
          />
          <NumericInput
            label="Weight (kg)"
            value={setDraft.weight}
            min={0}
            max={999}
            decimal
            step={2.5}
            placeholder="0"
            onChange={(value) =>
              onDraftChange(exerciseId, 'weight', String(value))
            }
          />

          <Button onClick={handleConfirmAdd} width="full" disabled={isAdding}>
            {isAdding ? <LoadingCircle size={18} /> : 'Add'}
          </Button>
        </div>
      </BottomDrawer>
    </div>
  );
}
