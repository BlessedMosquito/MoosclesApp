import { createClient } from '@/lib/supabase/client';

type UpsertWorkoutMetricsProps = {
  workoutId: string;
  durationSeconds: number;
  distanceMeters: number;
  wellBeing: number;
};

export type ReturnGetMetricsData = {
  workout_id: string;
  duration_seconds: number | null;
  distance_meters: number | null;
  average_pace: number | null;
  created_at: string;
  well_being: number;
};

const supabase = createClient();

export async function upsertWorkoutMetrics(props: UpsertWorkoutMetricsProps) {
  const { data, error } = await supabase
    .from('workout_metrics')
    .upsert({
      workout_id: props.workoutId,
      duration_seconds: props.durationSeconds ?? null,
      distance_meters: props.distanceMeters ?? null,
      well_being: props.wellBeing,
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
