import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

type GetWorkoutExpDataReturnProps = {
  workoutId: string;
  userId: string;
  workoutGroup: string;
  exercisesCount: number;
  setsCount: number;
  repsCount: number;
  durationMinutes: number;
  distanceMeters: number;
};

export async function getWorkoutExpData(
  workoutId: string
): Promise<GetWorkoutExpDataReturnProps> {
  const { data, error } = await supabase.rpc('get_workout_exp_data', {
    p_workout_id: workoutId,
  });

  if (error) {
    throw error;
  }

  return {
    workoutId: data.workout_id,
    userId: data.user_id,
    workoutGroup: data.workout_group,
    exercisesCount: data.exercises_count,
    setsCount: data.sets_count,
    repsCount: data.reps_count,
    durationMinutes: data.duration_minutes,
    distanceMeters: data.distance_meters,
  };
}
