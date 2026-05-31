import { supabase } from "@/lib/supabase";

export type WorkoutTypeProperties = {
  id: string;
  name: string;
  label: string;
};

export async function getWorkoutTypes(): Promise<WorkoutTypeProperties[]> {
  const { data, error } = await supabase.from("workout_types").select("*").order("name", { ascending: true });

  if (error){
    throw new Error(error.message);
  }

  return data ?? [];
}
