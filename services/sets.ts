import { createClient } from '@/lib/supabase/client';
import { LOCKED_WORKOUT_MESSAGE, toServiceError } from './serviceError';

type AddSetsProperties = {
  exerciseId: number | string;
  reps: number;
  weight: number;
  order: number;
};

export type ReturnGetSetsData = {
  id: string;
  created_at: string | null;
  exercise_id: string;
  reps: number;
  weight: number | null;
  set_order: number;
};

const supabase = createClient();

export async function addSets(props: AddSetsProperties) {
  const { data, error } = await supabase
    .from('sets')
    .insert({
      exercise_id: props.exerciseId,
      reps: props.reps,
      weight: props.weight,
      set_order: props.order,
    })
    .select()
    .single();

  if (error) {
    throw toServiceError(error, 'Could not add set.');
  }

  return data;
}

export async function deleteSet(setId: number | string) {
  const { data, error } = await supabase
    .from('sets')
    .delete()
    .eq('id', setId)
    .select('id');

  if (error) {
    throw toServiceError(error, 'Could not delete set.');
  }

  if (!data || data.length === 0) {
    throw new Error(LOCKED_WORKOUT_MESSAGE);
  }
}

export async function getSetsByExercise(
  exerciseId: string
): Promise<ReturnGetSetsData[]> {
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .eq('exercise_id', exerciseId)
    .order('set_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? ([] as ReturnGetSetsData[]);
}
