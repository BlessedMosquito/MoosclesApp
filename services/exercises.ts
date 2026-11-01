import { createClient } from '@/lib/supabase/client';
import { LOCKED_WORKOUT_MESSAGE, toServiceError } from './serviceError';

type AddExerciseProperties = {
  workoutId: number | string;
  name: string;
  exerciseListId?: string | null;
  order: number;
};

export type ReturnGetExercisesData = {
  id: string;
  created_at: string | null;
  workout_id: string;
  exercise_list_id: string | null;
  name: string;
  exercise_order: number;
};

const supabase = createClient();

export async function addExercise(props: AddExerciseProperties) {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      workout_id: props.workoutId,
      name: props.name,
      exercise_list_id: props.exerciseListId,
      exercise_order: props.order,
    })
    .select()
    .single();

  if (error) {
    throw toServiceError(error, 'Could not add exercise.');
  }

  return data;
}

export async function getExercisesByWorkout(
  workoutId: string
): Promise<ReturnGetExercisesData[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('exercise_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? ([] as ReturnGetExercisesData[]);
}

export async function deleteExercise({ exerciseId }: { exerciseId: string }) {
  const { data, error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)
    .select('id');

  if (error) {
    throw toServiceError(error, 'Could not delete exercise.');
  }

  if (!data || data.length === 0) {
    throw new Error(LOCKED_WORKOUT_MESSAGE);
  }
}
