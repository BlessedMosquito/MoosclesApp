import { getWeekRange } from '@/lib/helpers';
import { createClient } from '@/lib/supabase/client';

type UpsertWorkoutMetricsProps = {
  workoutId: string;
  durationMinutes: number;
  distanceMeters: number;
  wellBeing: number;
  userId: string;
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
  userId: string;
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
      user_id: props.userId,
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
    .maybeSingle();

  if (error) throw error;

  return data as ReturnGetMetricsData;
}

export async function getWeeklyDataSummary(
  props: GetWeeklyDataSummaryProps
): Promise<{ duration_minutes: number; distance_meters: number }> {
  const { start, end } = getWeekRange();

  const { data, error } = await supabase
    .from('workout_metrics')
    .select('duration_minutes, distance_meters')
    .eq('user_id', props.userId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());

  if (error) throw error;

  if (!data || data.length === 0) {
    return { duration_minutes: 0, distance_meters: 0 };
  }

  const rows = (data ?? []) as {
    duration_minutes: number | null;
    distance_meters: number | null;
  }[];

  return rows.reduce<{ duration_minutes: number; distance_meters: number }>(
    (acc, row) => ({
      duration_minutes: acc.duration_minutes + (row.duration_minutes ?? 0),
      distance_meters: acc.distance_meters + (row.distance_meters ?? 0),
    }),
    { duration_minutes: 0, distance_meters: 0 }
  );
}
