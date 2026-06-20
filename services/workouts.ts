import { supabase } from '@/lib/supabase';
import { ReturnGetWorkoutTypeData } from './workoutTypes';

type CreateWorkoutProperties = {
  name: string;
  workoutType: string;
  date: Date;
};

type GetWorkoutsProperties = {
  date?: Date;
  name?: string;
  workoutTypeId?: string;
};

export type ReturnGetWorkoutsData = {
  id: string;
  name: string;
  workout_date: string;
  workout_types: ReturnGetWorkoutTypeData;
};

export async function createWorkout(props: CreateWorkoutProperties) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated!');
  }
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      name: props.name,
      workout_date: props.date.toISOString(),
      workout_type_id: props.workoutType,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getWorkouts(
  filters?: GetWorkoutsProperties
): Promise<ReturnGetWorkoutsData[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated!');
  }

  let query = supabase
    .from('workouts')
    .select(
      `
        *,
        workout_types (
          id,
          name,
          label
        )
      `
    )
    .eq('user_id', user.id);

  if (filters?.date) {
    query = query.eq('workout_date', filters.date.toISOString().split('T')[0]);
  }

  if (filters?.name) {
    query = query.ilike('name', `%${filters.name}%`);
  }

  if (filters?.workoutTypeId) {
    query = query.eq('workout_type_id', filters.workoutTypeId);
  }

  const { data, error } = await query.order('workout_date', {
    ascending: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as ReturnGetWorkoutsData[];
}
