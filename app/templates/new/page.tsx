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
  getWorkoutTypes,
  getWorkoutTypesSubGroups,
  ReturnGetWorkoutTypeData,
} from '@/services/workoutTypes';

export default function NewTemplatePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [subgroups, setSubgroups] = useState<string[] | null>(null);
  const [subgroup, setSubgroup] = useState<string | null>(null);
  const [typesResult, setTypesResult] = useState<{
    subgroup: string;
    types: ReturnGetWorkoutTypeData[];
  } | null>(null);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const types = typesResult?.subgroup === subgroup ? typesResult.types : null;

  useEffect(() => {
    let cancelled = false;

    getWorkoutTypesSubGroups()
      .then((data) => {
        if (cancelled) return;
        setSubgroups(data);
        setSubgroup((current) => current ?? data[0] ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setSubgroups([]);
        setError('Could not load workout types.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!subgroup) return;

    let cancelled = false;

    getWorkoutTypes({ subgroup })
      .then((data) => {
        if (!cancelled) setTypesResult({ subgroup, types: data });
      })
      .catch(() => {
        if (cancelled) return;
        setTypesResult({ subgroup, types: [] });
        setError('Could not load workout types.');
      });

    return () => {
      cancelled = true;
    };
  }, [subgroup]);

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
            {subgroups === null ? (
              <div className="flex justify-center py-6">
                <LoadingCircle />
              </div>
            ) : (
              <>
                <div className="template-subgroups">
                  {subgroups.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSubgroup(item)}
                      className={cn(
                        'chip shrink-0',
                        item === subgroup && 'chip-active'
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {types === null ? (
                  <div className="flex justify-center py-6">
                    <LoadingCircle />
                  </div>
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
