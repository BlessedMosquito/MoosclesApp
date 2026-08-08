import { getWeekRange } from '@/lib/helpers';
import { createClient } from '@/lib/supabase/client';

type UpsertWorkoutMetricsProps = {
  workoutId: string;
  durationMinutes: number;
  distanceMeters: number;
  wellBeing: number;
};

export type ReturnGetMetricsData = {
  workout_id: string;
  duration_minutes: number | null;
  distance_meters: number | null;
  average_pace: number | null;
  created_at: string;
  well_being: number;
};

type GetWeeklyDataSummaryProps = {
  userId: number;
};

const supabase = createClient();

export async function upsertWorkoutMetrics(props: UpsertWorkoutMetricsProps) {
  const { data, error } = await supabase
    .from('workout_metrics')
    .upsert({
      workout_id: props.workoutId,
      duration_minutes: props.durationMinutes ?? null,
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

export async function getWeeklyDataSummary(props: GetWeeklyDataSummaryProps) {
  const { start, end } = getWeekRange();

  const { data, error } = await supabase
    .from('workout_metrics')
    .select('*')
    .eq('user_id', props.userId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .single();

  if (error) throw error;

  return data;
}
