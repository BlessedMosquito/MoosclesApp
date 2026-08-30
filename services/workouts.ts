import { createClient } from '@/lib/supabase/client';
import { ReturnGetWorkoutTypeData } from './workoutTypes';

type CreateWorkoutProperties = {
  userId: string;
  name: string;
  workoutType: string;
  date: Date;
};

type GetWorkoutsProperties = {
  userId: string;
  date?: Date;
  name?: string;
  workoutTypeId?: string;
};

export type ReturnGetWorkoutsData = {
  id: string;
  name: string;
  workout_date: string;
  completed_at: string | null;
  workout_types: ReturnGetWorkoutTypeData;
};

export type ExperienceBreakdownItem = {
  type: 'workout' | 'exercises' | 'sets' | 'reps' | 'duration' | 'distance';
  label: string;
  value?: number;
  amount: number;
};

export type CompleteWorkoutResult = {
  total_exp: number;
  breakdown: ExperienceBreakdownItem[];
};

const supabase = createClient();

export async function createWorkout(props: CreateWorkoutProperties) {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: props.userId,
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
  filters: GetWorkoutsProperties
): Promise<ReturnGetWorkoutsData[]> {
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
    .eq('user_id', filters.userId);

  if (filters.date) {
    query = query.eq('workout_date', filters.date.toISOString().split('T')[0]);
  }

  if (filters.name) {
    query = query.ilike('name', `%${filters.name}%`);
  }

  if (filters.workoutTypeId) {
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

export async function completeWorkout({ workoutId }: { workoutId: string }) {
  const { data, error } = await supabase.rpc('complete_workout', {
    p_workout_id: workoutId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as CompleteWorkoutResult;
}

export async function getCompletedWorkoutDays(
  userId: string,
  start: string,
  end: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('workout_date')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .gte('workout_date', start)
    .lt('workout_date', end);

  if (error) throw error;

  return ((data ?? []) as { workout_date: string }[]).map(
    (row) => row.workout_date
  );
}

export type WorkoutDaysResult = {
  workout_days: { date: string }[];
  workout_count: number;
  active_weeks: number;
};

export async function getWorkoutDaysForWeek(
  userId: string
): Promise<WorkoutDaysResult> {
  const { data, error } = await supabase.rpc('get_workout_days_for_week', {
    p_user_id: userId,
  });

  if (error) throw error;

  return data as WorkoutDaysResult;
}
