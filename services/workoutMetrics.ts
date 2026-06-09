import { supabase } from '@/lib/supabase';

type UpsertWorkoutMetricsProps = {
  workoutId: string;
  durationSeconds?: number;
  distanceMeters?: number;
  averagePaceSeconds?: number;
  calories?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
};

export type ReturnGetMetricsData = {
    duration: number;
    distance: number;
    pace: number;
}

export async function upsertWorkoutMetrics(props: UpsertWorkoutMetricsProps) {
  const { data, error } = await supabase
    .from('workout_metrics')
    .upsert({
      workout_id: props.workoutId,
      duration_seconds: props.durationSeconds ?? null,
      distance_meters: props.distanceMeters ?? null,
      average_pace_seconds: props.averagePaceSeconds ?? null,
      calories: props.calories ?? null,
      average_heart_rate: props.averageHeartRate ?? null,
      max_heart_rate: props.maxHeartRate ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getWorkoutMetrics(workoutId: string): Promise<ReturnGetMetricsData[]>{
    const {data, error} = await supabase
    .from('workout_metrics')
    .select('*')

    if(error) throw error


    return data
}