import { supabase } from '@/lib/supabase';

type CreateExerciseProperties = {
  workoutId: string;
  name: string;
  exerciseLibraryId?: string | null;
  order: number;
};

export async function addExercise(props: CreateExerciseProperties) {
    const { data, error } = await supabase.from('exercises').insert({
        workout_id: props.workoutId,
        name,
        exercise_library_id: props.exerciseLibraryId,
        exercise_order: props.order,
      }).select().single();
  
    if (error) {
      throw error;
    }
  
    return data;
}