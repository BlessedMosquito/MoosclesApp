import { createClient } from '@/lib/supabase/client';

type AddExerciseProperties = {
  workoutId: number | string;
  name: string;
  exerciseLibraryId?: string | null;
  order: number;
};

export type ReturnGetExercisesData = {
  id: string;
  name: string;
};

const supabase = createClient();

export async function addExercise(props: AddExerciseProperties) {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      workout_id: props.workoutId,
      name: props.name,
      exercise_library_id: props.exerciseLibraryId,
      exercise_order: props.order,
    })
    .select()
    .single();

  if (error) {
    throw error;
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
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId);

  if (error) {
    throw new Error(error.message);
  }
}
