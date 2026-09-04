'use client';

import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import CloseIcon from '@/components/icons/CloseIcon';
import DropDownIcon from '@/components/icons/DropDownIcon';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { ReturnGetExercisesData } from '@/services/exercises';
import { ReturnGetSetsData } from '@/services/sets';
import { Mode } from '@/types/common';
import Button from './Button';
import DeleteIcon from '../icons/DeleteIcon';
import PopupWindow from './popups/PopUpWindow';
import NumericInput from './inputs/NumericInput';
import { useState } from 'react';

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
  const { scale } = useResponsive();
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

  return (
    <div
      style={{
        padding: s(14, scale),
        borderRadius: s(14, scale),
        border: `1px solid ${colors.border}`,
        background: colors.componentsBg,
        color: colors.text,
        fontSize: fontSizes.body,
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(exercise)}
        style={{
          width: '100%',
          border: 'none',
          background: colors.transparent,
          color: colors.text,
          padding: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: s(12, scale),
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: fontSizes.body,
          fontWeight: 700,
        }}
      >
        <span>
          {index + 1}. {exercise.name}
        </span>

        <span>{isExpanded ? <CloseIcon /> : <DropDownIcon />}</span>
      </button>

      {isExpanded && (
        <div
          style={{
            marginTop: s(14, scale),
            display: 'flex',
            flexDirection: 'column',
            gap: s(10, scale),
          }}
        >
          {isLoadingSets ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: s(8, scale),
              }}
            >
              <LoadingCircle size={18} />
            </div>
          ) : exerciseSets.length === 0 ? (
            <p
              style={{
                margin: 0,
                color: colors.textMuted,
                fontSize: s(fontSizes.caption, scale),
              }}
            >
              No sets yet.
            </p>
          ) : (
            exerciseSets.map((setItem, setIndex) => (
              <div
                key={setItem.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr 1fr auto',
                  gap: s(10, scale),
                  alignItems: 'center',
                  padding: s(10, scale),
                  borderRadius: s(12, scale),
                  background: colors.componentsBg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <span style={{ color: colors.textMuted }}>{setIndex + 1}</span>

                <span>{setItem.reps} reps</span>
                <span>{setItem.weight} kg</span>
                {mode !== 'PREVIEW' && showDeletePopUp && (
                  <Button
                    onClick={() =>
                      showDeletePopUp(setItem.id.toString(), exerciseId)
                    }
                  >
                    <DeleteIcon />
                  </Button>
                )}
              </div>
            ))
          )}

          {mode !== 'PREVIEW' && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button width={'3/4'} onClick={handleAddClick}>
                {'Add set'}
              </Button>
            </div>
          )}

          {isPopupOpen && (
            <PopupWindow
              onClose={() => setIsPopupOpen(false)}
              title="Add data to your set"
            >
              <NumericInput
                value={Number(setDraft.reps) || 0}
                min={0}
                max={999}
                placeholder="Reps"
                onChange={(value) =>
                  onDraftChange(exerciseId, 'reps', String(value))
                }
              />

              <input
                inputMode="decimal"
                placeholder="Weight"
                value={setDraft.weight}
                onChange={(e) =>
                  onDraftChange(
                    exerciseId,
                    'weight',
                    e.target.value.replace(/[^0-9.,]/g, '')
                  )
                }
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  minWidth: 0,
                  padding: s(10, scale),
                  borderRadius: s(12, scale),
                  border: `1px solid ${colors.border}`,
                  background: colors.componentsBg,
                  color: colors.text,
                  fontSize: fontSizes.body,
                  outline: 'none',
                }}
              />

              <Button
                onClick={handleConfirmAdd}
                width="full"
                disabled={isAdding}
              >
                {isAdding ? <LoadingCircle size={18} /> : 'Add'}
              </Button>
            </PopupWindow>
          )}

          {mode !== 'PREVIEW' && isExpanded && onDeleteExercise && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button onClick={onDeleteExercise} width="3/4" color={colors.red}>
                Delete exercise
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
