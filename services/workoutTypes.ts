import { createClient } from '@/lib/supabase/client';

export type ReturnGetWorkoutTypeData = {
  id: string;
  name: string;
  label: string;
};

export type WorkoutTypeGroup =
  | 'DurationOnly'
  | 'DistanceDuration'
  | 'RepetitionBased';

const supabase = createClient();

export async function getWorkoutTypes({
  subgroup,
}: {
  subgroup: string;
}): Promise<ReturnGetWorkoutTypeData[]> {
  const { data, error } = await supabase
    .from('workout_types')
    .select('*', { distinct: true })
    .order('name', { ascending: true })
    .filter('workout_subgroup', 'eq', subgroup);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getWorkoutTypeGroup(id: string): Promise<string> {
  const { data, error } = await supabase
    .from('workout_types')
    .select('workout_group')
    .filter('id', 'eq', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.workout_group;
}

export async function getWorkoutTypesSubGroups(): Promise<string[]> {
  const { data, error } = await supabase
    .from('workout_types')
    .select('workout_subgroup', { distinct: true })
    .not('workout_subgroup', 'is', null);

  if (error) {
    throw new Error(error.message);
  }
  const unique = new Set<string>();
  for (const el of data) {
    unique.add(el.workout_subgroup);
  }
  return [...unique];
}
