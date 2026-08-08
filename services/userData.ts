import { createClient } from '@/lib/supabase/client';

export type UpsertUserDataProps = {
  userId: string;
  weeklyDistanceGoal: number;
  weeklyDurationGoal: number;
};

export type ReturnGetUserData = {
  experience: number;
  weekly_distance_goal_meters: number;
  weekly_duration_goal_minutes: number;
};

const supabase = createClient();

export async function getUserData(userId: string) {
  const { data } = await supabase
    .from('user_data')
    .select(
      'experience, weekly_distance_goal_meters, weekly_duration_goal_minutes'
    )
    .eq('user_id', userId)
    .maybeSingle();

  return (
    (data as ReturnGetUserData) ?? {
      experience: 0,
      weekly_duration_goal_minutes: 0,
      weekly_distance_goal_meters: 0,
    }
  );
}

export async function upsertUserData(props: UpsertUserDataProps) {
  const { data, error } = await supabase.from('user_data').upsert({
    user_id: props.userId,
    weekly_distance_goal_meters: props.weeklyDistanceGoal,
    weekly_duration_goal_minutes: props.weeklyDurationGoal,
  });
  if (error) throw error;

  return data;
}
