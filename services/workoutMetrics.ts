import { supabase } from '@/lib/supabase';

type UpsertWorkoutMetricsProps = {
  workoutId: string;
  durationSeconds?: number;
  distanceMeters?: number;
  averagePaceSeconds?: number;
};

export type ReturnGetMetricsData = {
  workout_id: string;
  duration_seconds: number | null;
  distance_meters: number | null;
  average_pace: number | null;
  created_at: string;
};

export async function upsertWorkoutMetrics(props: UpsertWorkoutMetricsProps) {
  const { data, error } = await supabase
    .from('workout_metrics')
    .upsert({
      workout_id: props.workoutId,
      duration_seconds: props.durationSeconds ?? null,
      distance_meters: props.distanceMeters ?? null,
      average_pace: props.averagePaceSeconds ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getWorkoutMetrics(
  workoutId: string
): Promise<ReturnGetMetricsData> {
  const { data, error } = await supabase
    .from('workout_metrics')
    .select('*')
    .filter('workout_id', 'eq', workoutId)
    .single();

  if (error) throw error;

  return data as ReturnGetMetricsData;
}
