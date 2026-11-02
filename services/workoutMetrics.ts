import { createClient } from '@/lib/supabase/client';
import { toServiceError } from './serviceError';

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
  created_at: string | null;
  well_being: number | null;
  user_id: string;
};

type GetMonthlyDataSummaryProps = {
  userId: string;
  date?: Date;
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

  if (error) throw toServiceError(error, 'Could not save workout data.');

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

export async function getMonthlyDataSummary(
  props: GetMonthlyDataSummaryProps
): Promise<{ duration_minutes: number; distance_meters: number }> {
  const date = props.date ?? new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

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
