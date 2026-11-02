'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/buttons/BackButton';
import Button from '@/components/ui/buttons/Button';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import TextInput from '@/components/ui/inputs/TextInput';
import ChoiceTile from '@/components/ui/tiles/ChoiceTile';
import TopBar from '@/components/ui/topBar/TopBar';
import { cn } from '@/lib/utils';
import { getWorkoutTypeIcon } from '@/lib/workoutTypeIcon';
import { createTemplate } from '@/services/workoutTemplates';
import {
  getWorkoutTypesByGroup,
  ReturnGetWorkoutTypeData,
} from '@/services/workoutTypes';

export default function NewTemplatePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [allTypes, setAllTypes] = useState<ReturnGetWorkoutTypeData[] | null>(
    null
  );
  const [subgroup, setSubgroup] = useState<string | null>(null);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subgroups = allTypes
    ? [...new Set(allTypes.map((type) => type.workout_subgroup ?? 'Other'))]
    : null;
  const activeSubgroup = subgroup ?? subgroups?.[0] ?? null;
  const types =
    allTypes?.filter(
      (type) => (type.workout_subgroup ?? 'Other') === activeSubgroup
    ) ?? null;

  useEffect(() => {
    let cancelled = false;

    getWorkoutTypesByGroup('RepetitionBased')
      .then((data) => {
        if (!cancelled) setAllTypes(data);
      })
      .catch(() => {
        if (cancelled) return;
        setAllTypes([]);
        setError('Could not load workout types.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate() {
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Name cannot be empty');
      return;
    }

    if (!/^[\p{L}\p{N}]/u.test(trimmed)) {
      setError('Name cannot start with a special character');
      return;
    }

    if (!typeId) {
      setError('Please select a workout type.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const template = await createTemplate({
        name: trimmed,
        workoutTypeId: typeId,
      });
      router.replace(`/templates/edit?templateId=${template.id}`);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Could not create template.'
      );
      setIsSaving(false);
    }
  }

  return (
    <main className="page page-padded">
      <div className="page-content page-content-narrow">
        <TopBar
          left={<BackButton onClick={() => router.back()} />}
          center="New template"
        />

        {error && (
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        )}

        <div className="template-form">
          <div className="field">
            <span className="field-label">Name</span>
            <TextInput
              placeholder="eg. Push day"
              value={name}
              onChange={setName}
            />
          </div>

          <div className="field">
            <span className="field-label">Workout type</span>
            <span className="field-hint">
              Templates are available for strength workouts only.
            </span>
            {subgroups === null ? (
              <div className="flex justify-center py-6">
                <LoadingCircle />
              </div>
            ) : (
              <>
                {subgroups.length > 1 && (
                  <div className="template-subgroups">
                    {subgroups.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSubgroup(item)}
                        className={cn(
                          'chip shrink-0',
                          item === activeSubgroup && 'chip-active'
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                {types === null || types.length === 0 ? (
                  <p className="muted-text">No strength workout types found.</p>
                ) : (
                  <div className="choice-grid" role="radiogroup">
                    {types.map((type, index) => (
                      <ChoiceTile
                        key={type.id}
                        icon={getWorkoutTypeIcon(type.name, type.workout_group)}
                        label={type.name}
                        index={index}
                        selected={type.id === typeId}
                        onClick={() => setTypeId(type.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <Button
            width="full"
            onClick={handleCreate}
            disabled={isSaving || !typeId || !name.trim()}
          >
            {isSaving ? <LoadingCircle size={18} /> : 'Create template'}
          </Button>
        </div>
      </div>
    </main>
  );
}
