import { supabase } from "@/lib/supabase";

export type ReturnGetWorkoutTypeData = {
  id: string;
  name: string;
  label: string;
};

export type  WorkoutTypeGroup = 'DurationOnly' | 'DistanceDuration' | 'RepetitionBased'

export async function getWorkoutTypes(): Promise<ReturnGetWorkoutTypeData[]> {
  const { data, error } = await supabase.from("workout_types").select("*").order("name", { ascending: true });

  if (error){
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getWorkoutTypeGroup(id: string): Promise<string> {
    const { data, error } = await supabase.from("workout_types").select("workout_group").filter('id', 'eq', id).single();

    if (error){
      throw new Error(error.message);
    }
  
    return data.workout_group;
}
