import { supabase } from '@/lib/supabase';

type AddSetsProperties = {
  exerciseId: number | string;
  reps: number;
  weight: number;
  order: number;
};

export type ReturnGetSetsData = {
  id: number | string;
  reps: number;
  weight: number;
};

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
    throw error;
  }

  return data;
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
