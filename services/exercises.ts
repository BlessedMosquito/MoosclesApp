import { supabase } from '@/lib/supabase';

type AddExerciseProperties = {
  workoutId: number | string;
  name: string;
  exerciseLibraryId?: string | null;
  order: number;
};

export type ReturnGetExercisesData = {
    id: string;
    name: string;
}

export async function addExercise(props: AddExerciseProperties) {
    const { data, error } = await supabase.from('exercises').insert({
        workout_id: props.workoutId,
        name: props.name,
        exercise_library_id: props.exerciseLibraryId,
        exercise_order: props.order,
      }).select().single();
  
    if (error) {
      throw error;
    }
  
    return data;
}

export async function getExercisesByWorkout(workoutId: string): Promise<ReturnGetExercisesData[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('exercise_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [] as ReturnGetExercisesData[];
}
