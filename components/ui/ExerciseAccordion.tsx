'use client';

import LoadingCircle from '@/components/ui/LoadingCircle';
import AddIcon from '@/components/icons/AddIcon';
import CloseIcon from '@/components/icons/CloseIcon';
import DropDownIcon from '@/components/icons/DropDownIcon';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { ReturnGetExercisesData } from '@/services/exercises';
import { ReturnGetSetsData } from '@/services/sets';

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

  onToggle: (exercise: ReturnGetExercisesData) => void;
  onDraftChange: (
    exerciseId: string,
    field: keyof SetDraft,
    value: string
  ) => void;
  onAddSet: (exercise: ReturnGetExercisesData) => void;
};

export default function ExerciseAccordion({
  exercise,
  index,
  isExpanded,
  exerciseSets,
  setDraft,
  isLoadingSets,
  onToggle,
  onDraftChange,
  onAddSet,
}: ExerciseAccordionProps) {
  const { scale } = useResponsive();

  const exerciseId = String(exercise.id);

  return (
    <div
      style={{
        padding: s(14, scale),
        borderRadius: s(14, scale),
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        color: colors.text,
        fontSize: s(fontSizes.bodySmall, scale),
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(exercise)}
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          color: colors.text,
          padding: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: s(12, scale),
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: s(fontSizes.bodySmall, scale),
          fontWeight: 700,
        }}
      >
        <span>
          {index + 1}. {exercise.name}
        </span>

        <span>
          {isExpanded ? <CloseIcon /> : <DropDownIcon />}
        </span>
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
                  gridTemplateColumns: 'auto 1fr 1fr',
                  gap: s(10, scale),
                  alignItems: 'center',
                  padding: s(10, scale),
                  borderRadius: s(12, scale),
                  background: colors.glass,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <span style={{ color: colors.textMuted }}>
                  {setIndex + 1}
                </span>

                <span>{setItem.reps} reps</span>
                <span>{setItem.weight} kg</span>
              </div>
            ))
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: s(8, scale),
            }}
          >
            <input
              inputMode="numeric"
              placeholder="Reps"
              value={setDraft.reps}
              onChange={(e) =>
                onDraftChange(
                  exerciseId,
                  'reps',
                  e.target.value
                )
              }
              style={{
                minWidth: 0,
                padding: s(10, scale),
                borderRadius: s(12, scale),
                border: `1px solid ${colors.border}`,
                background: colors.glass,
                color: colors.text,
                fontSize: s(fontSizes.bodySmall, scale),
                outline: 'none',
              }}
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
                minWidth: 0,
                padding: s(10, scale),
                borderRadius: s(12, scale),
                border: `1px solid ${colors.border}`,
                background: colors.glass,
                color: colors.text,
                fontSize: s(fontSizes.bodySmall, scale),
                outline: 'none',
              }}
            />

            <button
              type="button"
              onClick={() => onAddSet(exercise)}
              style={{
                width: s(42, scale),
                height: s(42, scale),
                borderRadius: s(12, scale),
                border: `1px solid ${colors.borderStrong}`,
                background: colors.text,
                color: colors.background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <AddIcon
                size={18}
                color="currentColor"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}