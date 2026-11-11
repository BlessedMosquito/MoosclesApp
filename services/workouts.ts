import { createClient } from '@/lib/supabase/client';
import { toDateKey } from '@/lib/helpers';
import { ReturnGetWorkoutTypeData } from './workoutTypes';
import { toServiceError } from './serviceError';

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
  created_at: string | null;
  user_id: string;
  name: string;
  workout_date: string;
  workout_type_id: string | null;
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

const errorMessage = 'An error occurred while';

const MISSING_FUNCTION_CODE = 'PGRST202';

export async function createWorkout(props: CreateWorkoutProperties) {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: props.userId,
      name: props.name,
      workout_date: toDateKey(props.date),
      workout_type_id: props.workoutType,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`${errorMessage} adding workout.`);
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
        workout_types (*)
      `
    )
    .eq('user_id', filters.userId);

  if (filters.date) {
    query = query.eq('workout_date', toDateKey(filters.date));
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
    throw new Error(`${errorMessage} loading workouts.`);
  }

  return data as ReturnGetWorkoutsData[];
}

export async function getWorkoutById(
  workoutId: string
): Promise<ReturnGetWorkoutsData | null> {
  const { data, error } = await supabase
    .from('workouts')
    .select(
      `
        *,
        workout_types (*)
      `
    )
    .eq('id', workoutId)
    .maybeSingle();

  if (error) {
    throw new Error(`${errorMessage} loading workout.`);
  }

  return data as ReturnGetWorkoutsData | null;
}

export async function canEditWorkout(workoutId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_edit_workout', {
    p_workout_id: workoutId,
  });

  if (!error) return data === true;

  if (error.code !== MISSING_FUNCTION_CODE) {
    throw new Error(`${errorMessage} checking workout.`);
  }

  const workout = await getWorkoutById(workoutId);
  return workout !== null && workout.completed_at === null;
}

export async function deleteWorkout(workoutId: string) {
  if (!(await canEditWorkout(workoutId))) {
    throw new Error('Completed workouts cannot be deleted.');
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('id')
    .eq('workout_id', workoutId);

  if (exercisesError) {
    throw new Error(`${errorMessage} deleting workout.`);
  }

  const exerciseIds = (exercises ?? []).map(
    (exercise: { id: string }) => exercise.id
  );

  if (exerciseIds.length > 0) {
    const { error: setsError } = await supabase
      .from('sets')
      .delete()
      .in('exercise_id', exerciseIds);

    if (setsError) {
      throw toServiceError(setsError, `${errorMessage} deleting workout.`);
    }
  }

  const [{ error: deleteExercisesError }, { error: metricsError }] =
    await Promise.all([
      supabase.from('exercises').delete().eq('workout_id', workoutId),
      supabase.from('workout_metrics').delete().eq('workout_id', workoutId),
    ]);

  const childError = deleteExercisesError ?? metricsError;
  if (childError) {
    throw toServiceError(childError, `${errorMessage} deleting workout.`);
  }

  const { data, error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .is('completed_at', null)
    .select('id');

  if (error) {
    throw new Error(`${errorMessage} deleting workout.`);
  }

  if (!data || data.length === 0) {
    throw new Error('Workout could not be deleted.');
  }
}

export async function completeWorkout({ workoutId }: { workoutId: string }) {
  const { data, error } = await supabase.rpc('complete_workout', {
    p_workout_id: workoutId,
  });

  if (error) {
    throw toServiceError(error, `${errorMessage} completing workout.`);
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

export type ReturnCompletedWorkoutData = {
  workout_date: string;
  name: string;
};

export async function getCompletedWorkouts(
  userId: string,
  start: string,
  end: string
): Promise<ReturnCompletedWorkoutData[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('workout_date, name')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .gte('workout_date', start)
    .lt('workout_date', end);

  if (error) {
    throw new Error(`${errorMessage} loading completed workouts.`);
  }

  return (data ?? []) as ReturnCompletedWorkoutData[];
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
